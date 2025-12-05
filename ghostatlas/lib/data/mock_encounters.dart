import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/encounter.dart';

/// Mock data for testing and development
class MockEncounters {
  static List<Encounter> getMockEncounters() {
    return [
      Encounter(
        id: '1',
        authorName: 'Sarah M.',
        location: const LatLng(37.7749, -122.4194), // San Francisco
        originalStory: 'I saw a shadowy figure in my hallway at 3 AM.',
        enhancedStory:
            'The clock struck 3 AM when I awoke to an inexplicable chill. As my eyes adjusted to the darkness, I witnessed a shadowy figure gliding silently through my hallway. Its form was humanoid yet translucent, moving with an otherworldly grace that defied natural explanation. The temperature dropped noticeably as it passed, and I felt an overwhelming sense of being watched by something not of this world.',
        title: 'The Midnight Shadow in My Hallway',
        encounterTime: DateTime.now().subtract(const Duration(days: 2)),
        submittedAt: DateTime.now().subtract(const Duration(days: 1)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost1/400/300'],
        narrationUrl: null,
        rating: 42,
        verificationCount: 8,
        averageSpookiness: 7.5,
      ),
      Encounter(
        id: '2',
        authorName: 'Michael Chen',
        location: const LatLng(34.0522, -118.2437), // Los Angeles
        originalStory: 'Heard footsteps in the attic when nobody was home.',
        enhancedStory:
            'Home alone on a quiet Tuesday evening, I heard distinct footsteps echoing from the attic above. Each creak of the floorboards sent chills down my spine. The rhythmic pattern suggested someone pacing back and forth, yet I knew with certainty that I was the only living soul in the house. When I mustered the courage to investigate, the attic was empty, but the air felt thick with an unseen presence.',
        title: 'Phantom Footsteps Above',
        encounterTime: DateTime.now().subtract(const Duration(days: 5)),
        submittedAt: DateTime.now().subtract(const Duration(days: 4)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost2/400/300'],
        narrationUrl: null,
        rating: 35,
        verificationCount: 12,
        averageSpookiness: 6.8,
      ),
      Encounter(
        id: '3',
        authorName: 'Emily Rodriguez',
        location: const LatLng(40.7128, -74.0060), // New York
        originalStory: 'My grandmother appeared to me the night she died.',
        enhancedStory:
            'On the night my grandmother passed away in the hospital, I was awakened by a gentle touch on my shoulder. Opening my eyes, I saw her standing beside my bed, bathed in a soft, ethereal glow. She smiled at me with the warmth I had always known, whispered "I love you," and slowly faded away. Minutes later, the hospital called to inform us of her passing. She had come to say goodbye.',
        title: "Grandmother's Final Goodbye",
        encounterTime: DateTime.now().subtract(const Duration(days: 30)),
        submittedAt: DateTime.now().subtract(const Duration(days: 28)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost3/400/300'],
        narrationUrl: null,
        rating: 89,
        verificationCount: 23,
        averageSpookiness: 5.2,
      ),
      Encounter(
        id: '4',
        authorName: 'James Wilson',
        location: const LatLng(41.8781, -87.6298), // Chicago
        originalStory: 'Doors slamming shut by themselves in old house.',
        enhancedStory:
            'Living in a century-old Victorian home, I have grown accustomed to its quirks, but nothing prepared me for last Thursday. Every door in the house began slamming shut in rapid succession, starting from the basement and moving upward through each floor. No windows were open, no drafts present. The violent force shook the frames and rattled the walls. Then, as suddenly as it began, complete silence fell over the house.',
        title: 'The Victorian House Awakens',
        encounterTime: DateTime.now().subtract(const Duration(days: 7)),
        submittedAt: DateTime.now().subtract(const Duration(days: 6)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost4/400/300'],
        narrationUrl: null,
        rating: 56,
        verificationCount: 15,
        averageSpookiness: 8.1,
      ),
      Encounter(
        id: '5',
        authorName: 'Amanda Foster',
        location: const LatLng(29.7604, -95.3698), // Houston
        originalStory: 'Child laughing in empty nursery at midnight.',
        enhancedStory:
            'The baby monitor crackled to life at midnight with the sound of a child\'s laughter. But our nursery has been empty for years. I rushed upstairs to find the room ice cold, the rocking chair swaying gently on its own. The laughter continued, innocent and playful, yet deeply unsettling. Through the monitor, I could hear the distinct sound of toys being moved across the floor. When I turned on the light, everything stopped instantly.',
        title: 'Laughter in the Empty Nursery',
        encounterTime: DateTime.now().subtract(const Duration(days: 14)),
        submittedAt: DateTime.now().subtract(const Duration(days: 13)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost5/400/300'],
        narrationUrl: null,
        rating: 67,
        verificationCount: 19,
        averageSpookiness: 9.2,
      ),
      Encounter(
        id: '6',
        authorName: 'David Park',
        location: const LatLng(33.4484, -112.0740), // Phoenix
        originalStory: 'Saw my reflection move independently in mirror.',
        enhancedStory:
            'While brushing my teeth before bed, I noticed my reflection in the bathroom mirror behaving strangely. At first, it was subtle - a slight delay in movements. Then, horrifyingly, my reflection smiled while my face remained neutral. It raised its hand and waved at me while I stood frozen in terror. For several seconds, my reflection acted with complete autonomy before suddenly syncing back with my movements.',
        title: 'The Mirror That Lies',
        encounterTime: DateTime.now().subtract(const Duration(days: 3)),
        submittedAt: DateTime.now().subtract(const Duration(days: 2)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost6/400/300'],
        narrationUrl: null,
        rating: 78,
        verificationCount: 21,
        averageSpookiness: 8.7,
      ),
      Encounter(
        id: '7',
        authorName: 'Lisa Thompson',
        location: const LatLng(39.7392, -104.9903), // Denver
        originalStory: 'Piano playing by itself in the middle of the night.',
        enhancedStory:
            'At 2:47 AM, I was awakened by the haunting melody of our grand piano playing downstairs. The music was beautiful yet melancholic, a piece I had never heard before. Creeping down the stairs, I watched in disbelief as the keys pressed themselves down, creating the ethereal tune. No one sat at the bench. The pedals moved on their own. When I called out, the music stopped abruptly, leaving only the echo of the final note hanging in the air.',
        title: 'The Phantom Pianist',
        encounterTime: DateTime.now().subtract(const Duration(days: 21)),
        submittedAt: DateTime.now().subtract(const Duration(days: 20)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost7/400/300'],
        narrationUrl: null,
        rating: 94,
        verificationCount: 27,
        averageSpookiness: 7.9,
      ),
      Encounter(
        id: '8',
        authorName: 'Robert Martinez',
        location: const LatLng(47.6062, -122.3321), // Seattle
        originalStory: 'Felt someone sit on my bed but nobody was there.',
        enhancedStory:
            'In the dead of night, I felt the unmistakable sensation of someone sitting down on the edge of my bed. The mattress compressed under their weight, and I could feel the shift in balance. My heart raced as I lay paralyzed with fear, eyes wide open in the darkness. I felt a gentle hand touch my shoulder, as if to comfort me. When I finally found the courage to turn on the light, I was completely alone. The indentation on the mattress slowly returned to normal.',
        title: 'The Invisible Visitor',
        encounterTime: DateTime.now().subtract(const Duration(days: 10)),
        submittedAt: DateTime.now().subtract(const Duration(days: 9)),
        status: 'approved',
        imageUrls: [],
        illustrationUrls: ['https://picsum.photos/seed/ghost8/400/300'],
        narrationUrl: null,
        rating: 61,
        verificationCount: 16,
        averageSpookiness: 8.4,
      ),
    ];
  }
}
