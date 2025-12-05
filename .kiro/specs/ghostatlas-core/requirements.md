# Requirements Document

## Introduction

GhostAtlas is a mobile-first horror experience platform that enables users to record, share, and explore real-life ghost encounters. The system transforms user-submitted paranormal experiences into immersive, AI-enhanced horror narratives while building a crowdsourced global map of supernatural activity. Users can submit their own encounters, explore haunted locations worldwide, and physically verify other users' experiences through location-based check-ins.

## Glossary

- **GhostAtlas System**: The complete mobile application platform for recording and exploring paranormal encounters
- **User**: An individual who interacts with the GhostAtlas System to submit, explore, or verify ghost encounters (no authentication required)
- **Author Name**: A user-provided display name associated with submitted content (no account creation required)
- **Ghost Encounter**: A user-submitted paranormal experience including location, narrative, timestamp, and optional media
- **Story Enhancement Pipeline**: The AI-driven process that transforms raw user narratives into atmospheric horror stories
- **Haunted Map**: The global interactive map displaying all approved ghost encounters as location markers
- **Hotspot**: A location on the Haunted Map with multiple ghost encounters, visually indicated by glowing and pulsing effects
- **Ghostbuster Mode**: The feature enabling users to physically visit and verify haunted locations
- **Verification**: A user's physical check-in at a previously reported haunted location
- **Spookiness Score**: A numerical rating (0-10) assigned during verification to indicate the perceived supernatural intensity of a location
- **Encounter Rating**: Community-driven rating system for evaluating the quality and credibility of ghost encounters
- **Admin Panel**: A hidden administrative interface for reviewing and approving submitted content
- **AWS Backend**: Cloud infrastructure services handling data storage, AI processing, and backend operations

## Requirements

### Requirement 1

**User Story:** As a user, I want to submit my own ghost encounter with an author name, location, story, time, and images, so that I can share my paranormal experience without creating an account

#### Acceptance Criteria

1. WHEN a User initiates encounter submission, THE GhostAtlas System SHALL present input fields for Author Name, location, narrative text, time of occurrence, and optional image uploads
2. WHEN a User provides location data, THE GhostAtlas System SHALL capture geographic coordinates with accuracy within 10 meters
3. WHEN a User submits a Ghost Encounter with all required fields completed, THE GhostAtlas System SHALL store the encounter data in pending status awaiting admin approval
4. IF a User attempts to submit a Ghost Encounter with missing required fields, THEN THE GhostAtlas System SHALL display validation error messages indicating which fields require completion
5. WHEN a User uploads images with a Ghost Encounter, THE GhostAtlas System SHALL accept common image formats (JPEG, PNG, HEIC) with file sizes up to 10 megabytes per image

### Requirement 2

**User Story:** As a user, I want my submitted ghost story to be automatically enhanced into a cinematic horror narrative, so that my experience becomes more atmospheric and engaging

#### Acceptance Criteria

1. WHEN a Ghost Encounter is successfully submitted, THE Story Enhancement Pipeline SHALL process the raw narrative within 30 seconds
2. WHEN the Story Enhancement Pipeline processes a narrative, THE GhostAtlas System SHALL generate an atmospheric horror version that preserves the original factual details
3. WHEN story enhancement completes, THE GhostAtlas System SHALL generate a haunting illustration that visually represents the encounter
4. WHEN story enhancement completes, THE GhostAtlas System SHALL generate an eerie voice narration audio file that matches the tone of the enhanced narrative
5. WHEN all enhancement artifacts are generated, THE GhostAtlas System SHALL associate the enhanced story, illustration, and narration with the original Ghost Encounter

### Requirement 3

**User Story:** As a user, I want to see all ghost encounters displayed on a global map, so that I can explore haunted locations around the world

#### Acceptance Criteria

1. WHEN a User accesses the Haunted Map, THE GhostAtlas System SHALL display all approved Ghost Encounters as location markers on an interactive map interface
2. WHEN multiple Ghost Encounters exist at the same location, THE GhostAtlas System SHALL render that location as a Hotspot with glowing and pulsing visual effects
3. WHEN a User taps on a location marker, THE GhostAtlas System SHALL display the associated Ghost Encounter details including enhanced narrative, illustration, and narration playback option
4. WHEN a User navigates the Haunted Map, THE GhostAtlas System SHALL support pan, zoom, and location search functionality
5. WHEN a User views the Haunted Map, THE GhostAtlas System SHALL indicate Hotspot intensity through visual prominence based on the number of encounters at that location

### Requirement 4

**User Story:** As a user, I want to physically visit haunted locations and verify other users' experiences, so that I can contribute to community-driven paranormal investigation

#### Acceptance Criteria

1. WHEN a User is within 50 meters of a Ghost Encounter location, THE GhostAtlas System SHALL enable Ghostbuster Mode for that location
2. WHEN a User activates Ghostbuster Mode at a valid location, THE GhostAtlas System SHALL prompt the User to provide a Spookiness Score between 0 and 10
3. WHEN a User submits a Verification, THE GhostAtlas System SHALL record the check-in timestamp, Spookiness Score, and optional experience notes
4. WHEN a User visits a location at the same time of day as the original Ghost Encounter occurred (within 2 hours), THE GhostAtlas System SHALL mark the Verification as time-matched and award bonus credibility
5. WHEN a Verification is submitted, THE GhostAtlas System SHALL associate it with the original Ghost Encounter and update the location's verification count

### Requirement 5

**User Story:** As a user, I want to rate ghost encounters and verifications, so that the most credible and unsettling stories rise to the top

#### Acceptance Criteria

1. WHEN a User views a Ghost Encounter, THE GhostAtlas System SHALL display an Encounter Rating interface allowing upvote or downvote actions
2. WHEN a User submits an Encounter Rating, THE GhostAtlas System SHALL update the encounter's total rating score within 2 seconds
3. WHEN a User views the Haunted Map or encounter lists, THE GhostAtlas System SHALL sort locations and stories by rating score in descending order by default
4. WHEN a User views a Verification, THE GhostAtlas System SHALL display the associated Spookiness Score and allow rating of the verification's credibility
5. THE GhostAtlas System SHALL prevent a User from rating the same Ghost Encounter or Verification more than once

### Requirement 6

**User Story:** As a user, I want to explore haunted locations near me or search for specific areas, so that I can discover paranormal activity in places I care about

#### Acceptance Criteria

1. WHEN a User grants location permissions, THE GhostAtlas System SHALL display Ghost Encounters sorted by proximity to the User's current location
2. WHEN a User searches for a location by name or address, THE GhostAtlas System SHALL return relevant Ghost Encounters within that geographic area
3. WHEN a User applies distance filters, THE GhostAtlas System SHALL display only Ghost Encounters within the specified radius
4. WHEN a User views nearby encounters, THE GhostAtlas System SHALL display the distance from the User's current location to each Ghost Encounter
5. THE GhostAtlas System SHALL update the User's location in real-time as they move to maintain accurate proximity calculations

### Requirement 7

**User Story:** As an admin, I want to review and approve submitted ghost encounters through a hidden admin panel, so that I can maintain content quality before stories appear on the map

#### Acceptance Criteria

1. WHEN a User taps a specific UI element 11 consecutive times, THE GhostAtlas System SHALL unlock and display the Admin Panel tab
2. WHEN an admin accesses the Admin Panel, THE GhostAtlas System SHALL display all pending Ghost Encounters awaiting approval
3. WHEN an admin reviews a pending Ghost Encounter, THE GhostAtlas System SHALL provide options to approve or reject the submission
4. WHEN an admin approves a Ghost Encounter, THE GhostAtlas System SHALL change its status to approved and make it visible on the Haunted Map within 5 seconds
5. WHEN an admin rejects a Ghost Encounter, THE GhostAtlas System SHALL remove it from the pending queue and prevent it from appearing on the Haunted Map

### Requirement 8

**User Story:** As a developer, I want the system to integrate with AWS backend services, so that data storage, AI processing, and scalable operations are handled reliably

#### Acceptance Criteria

1. WHEN a Ghost Encounter is submitted, THE GhostAtlas System SHALL transmit the data to AWS Backend services for persistent storage
2. WHEN the Story Enhancement Pipeline processes narratives, THE GhostAtlas System SHALL utilize AWS Backend AI services for text enhancement, image generation, and voice synthesis
3. WHEN a User queries the Haunted Map, THE GhostAtlas System SHALL retrieve approved Ghost Encounters from AWS Backend data stores with response times under 2 seconds
4. WHEN images are uploaded, THE GhostAtlas System SHALL store media files in AWS Backend object storage with secure access controls
5. THE GhostAtlas System SHALL handle AWS Backend service failures gracefully by displaying user-friendly error messages and retry mechanisms
