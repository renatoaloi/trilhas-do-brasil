## Purpose

Permite ao usuário autenticado criar um pino (pivot) a partir do mapa principal, capturando coordenadas pelo duplo clique e completando o cadastro no mesmo formulário usado na lista de pivots.

## ADDED Requirements

### Requirement: Double-click on map opens create pivot flow

The system SHALL open the create-pivot form when the authenticated user double-clicks (or double-taps) an empty area of the main map (Dashboard), using the geographic coordinates of that interaction as the initial latitude and longitude.

#### Scenario: Double-click on empty map area

- **WHEN** the user double-clicks an empty area of the Dashboard map
- **THEN** the create-pivot modal opens with latitude and longitude set from the click position

#### Scenario: Map double-click does not zoom

- **WHEN** the user double-clicks the Dashboard map while create-from-map is enabled
- **THEN** the map MUST NOT zoom as a result of that double-click

### Requirement: Single click on existing pin shows details

The system SHALL keep single-click on an existing pin marker as the way to open that pin’s detail panel, independent of the create-from-map flow.

#### Scenario: Click existing pin

- **WHEN** the user single-clicks a pin marker on the map
- **THEN** the detail panel for that pin opens
- **AND** the create-pivot modal does not open solely because of that single click

### Requirement: Coordinates prefilled and editable

When the create-pivot form is opened from the map, the system SHALL prefill latitude and longitude from the map interaction and MUST allow the user to edit both fields before submit.

#### Scenario: User adjusts coordinates after map placement

- **WHEN** the create-pivot modal was opened from a map double-click
- **AND** the user changes latitude and/or longitude in the form
- **THEN** the submitted values MUST be the edited values (within valid lat/lng ranges enforced by the API)

#### Scenario: Create from Pivots list without map coords

- **WHEN** the user opens create pivot from the Pivots page “Novo pino” action
- **THEN** the same create form is used
- **AND** latitude and longitude start empty (user enters them manually) unless otherwise provided

### Requirement: Successful create refreshes map pins

After a successful create from the Dashboard map flow, the system SHALL close the create modal and refresh the visible pin set on the map so the new pivot appears without a full page reload.

#### Scenario: New pin appears after save

- **WHEN** the user saves a valid new pivot from the Dashboard create modal
- **THEN** the modal closes
- **AND** the new pin is included in the map’s displayed pivots (via reload of the current viewport query or equivalent)

### Requirement: Discoverability hint on map screen

The Dashboard map screen SHALL show a short hint that double-click creates a pin, so users can discover the gesture without documentation.

#### Scenario: Hint visible on Mapa

- **WHEN** the authenticated user views the Dashboard (Mapa) screen
- **THEN** a visible hint indicates that double-clicking the map creates a pin
