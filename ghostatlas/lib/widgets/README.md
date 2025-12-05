# GhostAtlas Widgets

This directory contains reusable UI components used throughout the GhostAtlas app to ensure consistent styling and behavior.

## Components

### LoadingIndicator
A consistent loading spinner with optional message text.

**Usage:**
```dart
LoadingIndicator(message: 'Loading encounters...')
```

### ErrorView
A standardized error display with icon, title, message, and optional retry button.

**Usage:**
```dart
ErrorView(
  title: 'Error loading data',
  message: errorMessage,
  onRetry: _loadData,
)
```

### EmptyState
A friendly empty state display for when no data is available.

**Usage:**
```dart
EmptyState(
  icon: Icons.search_off,
  title: 'No encounters found',
  subtitle: 'Try adjusting your filters',
  action: ElevatedButton(...),
)
```

### SuccessAnimation
An animated success dialog with checkmark animation.

**Usage:**
```dart
SuccessAnimation.show(
  context,
  title: 'Success!',
  message: 'Your action was completed',
  onComplete: () => print('Dialog closed'),
)
```

### SnackbarHelper
Helper methods for showing consistent snackbars across the app.

**Usage:**
```dart
SnackbarHelper.showSuccess(context, 'Item saved');
SnackbarHelper.showError(context, 'Failed to save');
SnackbarHelper.showWarning(context, 'Please check your input');
SnackbarHelper.showInfo(context, 'New feature available');
```

## Design Principles

- **Consistency**: All widgets follow the same design language
- **Accessibility**: Proper contrast ratios and semantic elements
- **Responsiveness**: Adapts to different screen sizes
- **Animation**: Smooth transitions and feedback
