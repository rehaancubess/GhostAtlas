import 'package:flutter/material.dart';
import '../models/encounter.dart';
import '../services/api_service.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/error_view.dart';
import '../widgets/empty_state.dart';
import '../widgets/snackbar_helper.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  final ApiService _apiService = ApiService();
  List<Encounter> _pendingEncounters = [];
  bool _isLoading = true;
  String? _errorMessage;
  final Set<String> _processingIds = {};

  @override
  void initState() {
    super.initState();
    _loadPendingEncounters();
  }

  @override
  void dispose() {
    _apiService.dispose();
    super.dispose();
  }

  Future<void> _loadPendingEncounters() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final encounters = await _apiService.getPendingEncounters();
      setState(() {
        _pendingEncounters = encounters;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _approveEncounter(String id) async {
    setState(() {
      _processingIds.add(id);
    });

    try {
      await _apiService.approveEncounter(id);

      // Show success message with AI enhancement info
      if (mounted) {
        SnackbarHelper.showSuccess(
          context,
          'Encounter approved! AI enhancement in progress (~60 seconds)...',
        );
      }

      // Refresh the list
      await _loadPendingEncounters();
    } catch (e) {
      if (mounted) {
        SnackbarHelper.showError(context, 'Failed to approve: ${e.toString()}');
      }
    } finally {
      setState(() {
        _processingIds.remove(id);
      });
    }
  }

  Future<void> _rejectEncounter(String id) async {
    setState(() {
      _processingIds.add(id);
    });

    try {
      await _apiService.rejectEncounter(id);

      // Show success message
      if (mounted) {
        SnackbarHelper.showWarning(context, 'Encounter rejected');
      }

      // Refresh the list
      await _loadPendingEncounters();
    } catch (e) {
      if (mounted) {
        SnackbarHelper.showError(context, 'Failed to reject: ${e.toString()}');
      }
    } finally {
      setState(() {
        _processingIds.remove(id);
      });
    }
  }

  void _showEncounterDetails(Encounter encounter) {
    showDialog(
      context: context,
      builder:
          (context) => Dialog(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 600, maxHeight: 700),
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.deepPurple,
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(4),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, color: Colors.white),
                        const SizedBox(width: 8),
                        const Text(
                          'Encounter Details',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),

                  // Content
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailRow('Author', encounter.authorName),
                          const SizedBox(height: 12),
                          _buildDetailRow(
                            'Location',
                            '${encounter.location.latitude.toStringAsFixed(6)}, ${encounter.location.longitude.toStringAsFixed(6)}',
                          ),
                          const SizedBox(height: 12),
                          _buildDetailRow(
                            'Encounter Time',
                            _formatDateTime(encounter.encounterTime),
                          ),
                          const SizedBox(height: 12),
                          _buildDetailRow(
                            'Submitted',
                            _formatDateTime(encounter.submittedAt),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Story:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            encounter.originalStory,
                            style: const TextStyle(fontSize: 14),
                          ),
                          if (encounter.imageUrls.isNotEmpty) ...[
                            const SizedBox(height: 16),
                            const Text(
                              'Images:',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children:
                                  encounter.imageUrls.map((url) {
                                    return ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.network(
                                        url,
                                        width: 100,
                                        height: 100,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) =>
                                                Container(
                                                  width: 100,
                                                  height: 100,
                                                  color: Colors.grey[300],
                                                  child: const Icon(
                                                    Icons.image_not_supported,
                                                  ),
                                                ),
                                      ),
                                    );
                                  }).toList(),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(
            '$label:',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
        ),
        Expanded(child: Text(value, style: const TextStyle(fontSize: 14))),
      ],
    );
  }

  String _formatDateTime(DateTime date) {
    return '${date.month}/${date.day}/${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: GhostAtlasColors.secondaryBackground,
        elevation: 0,
        title: RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'Admin ',
                style: GhostAtlasTypography.appTitle.copyWith(
                  color: GhostAtlasColors.ghostGreen,
                  fontSize: 28,
                ),
              ),
              TextSpan(
                text: 'Panel',
                style: GhostAtlasTypography.appTitle.copyWith(
                  color: Colors.red,
                  fontSize: 28,
                ),
              ),
            ],
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: GhostAtlasColors.ghostGreen),
            onPressed: _isLoading ? null : _loadPendingEncounters,
            tooltip: 'Refresh',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.transparent,
                  GhostAtlasColors.ghostGreen.withValues(alpha: 0.5),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const LoadingIndicator(message: 'Loading pending encounters...');
    }

    if (_errorMessage != null) {
      return ErrorView(
        message: 'Error Loading Encounters: $_errorMessage',
        onRetry: _loadPendingEncounters,
      );
    }

    if (_pendingEncounters.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadPendingEncounters,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SizedBox(
            height: MediaQuery.of(context).size.height - 100,
            child: EmptyState(
              icon: Icons.check_circle_outline,
              title: 'No Pending Encounters',
              message:
                  'All encounters have been reviewed.\nPull down to refresh.',
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPendingEncounters,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _pendingEncounters.length,
        itemBuilder: (context, index) {
          final encounter = _pendingEncounters[index];
          final isProcessing = _processingIds.contains(encounter.id);

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with author and time
                  Row(
                    children: [
                      const Icon(Icons.person, size: 20, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text(
                        encounter.authorName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        _formatDateTime(encounter.submittedAt),
                        style: TextStyle(color: Colors.grey[600], fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Location
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on,
                        size: 16,
                        color: Colors.grey,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${encounter.location.latitude.toStringAsFixed(4)}, ${encounter.location.longitude.toStringAsFixed(4)}',
                        style: TextStyle(color: Colors.grey[700], fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Story preview
                  Text(
                    encounter.originalStory,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 12),

                  // Images preview
                  if (encounter.imageUrls.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          const Icon(Icons.image, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            '${encounter.imageUrls.length} image${encounter.imageUrls.length > 1 ? 's' : ''}',
                            style: TextStyle(
                              color: Colors.grey[700],
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed:
                              isProcessing
                                  ? null
                                  : () => _showEncounterDetails(encounter),
                          icon: const Icon(Icons.visibility, size: 18),
                          label: const Text('View Details'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.deepPurple,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed:
                              isProcessing
                                  ? null
                                  : () => _approveEncounter(encounter.id),
                          icon:
                              isProcessing
                                  ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                  : const Icon(Icons.check, size: 18),
                          label: const Text('Approve'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed:
                              isProcessing
                                  ? null
                                  : () => _rejectEncounter(encounter.id),
                          icon: const Icon(Icons.close, size: 18),
                          label: const Text('Reject'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
