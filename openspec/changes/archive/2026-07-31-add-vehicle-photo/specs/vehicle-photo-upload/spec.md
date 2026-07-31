## Purpose

Allows users to attach a photo to each vehicle in their registration, making the vehicle list more visual and helping users quickly identify their vehicles.

## ADDED Requirements

### Requirement: Vehicle photo upload

The system SHALL allow users to upload a photo for each vehicle they own, stored on the backend and served via the existing file endpoint.

#### Scenario: User uploads a photo for a vehicle

- **WHEN** user selects a JPEG, PNG, WEBP, or GIF image for a vehicle they own
- **THEN** the photo is saved to `storage/{vehicle_id}/foto/` and the file path is stored in the vehicle record
- **AND** the photo is displayed in the vehicle card on the vehicles page

#### Scenario: User uploads an invalid file

- **WHEN** user selects a file exceeding 5 MB or with an unsupported content type
- **THEN** the upload is rejected with an appropriate error message

#### Scenario: Non-owner attempts to upload photo

- **WHEN** a user attempts to upload a photo for a vehicle they do not own
- **THEN** the request is rejected with a 403 Forbidden response

### Requirement: Vehicle photo display

Each vehicle card in the vehicles list SHALL display its photo when one has been uploaded.

#### Scenario: Vehicle has a photo

- **WHEN** a vehicle has an associated photo
- **THEN** the photo is displayed as a thumbnail on the vehicle card

#### Scenario: Vehicle has no photo

- **WHEN** a vehicle has no associated photo
- **THEN** a placeholder or no image is shown on the vehicle card
