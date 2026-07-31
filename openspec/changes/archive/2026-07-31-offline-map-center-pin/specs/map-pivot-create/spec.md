## MODIFIED Requirements

### Requirement: Double-click on map opens create pivot flow

The system SHALL open the create-pivot form when the authenticated user double-clicks (or double-taps) an empty area of the main map (Dashboard), using the geographic coordinates of that interaction as the initial latitude and longitude. While offline center-selection mode is active, double-click MUST NOT open the create-pivot form.

#### Scenario: Double-click on empty map area

- **WHEN** the user double-clicks an empty area of the Dashboard map
- **AND** offline center-selection mode is not active
- **THEN** the create-pivot modal opens with latitude and longitude set from the click position

#### Scenario: Map double-click does not zoom

- **WHEN** the user double-clicks the Dashboard map while create-from-map is enabled
- **THEN** the map MUST NOT zoom as a result of that double-click

#### Scenario: Double-click suppressed during offline selection

- **WHEN** offline center-selection mode is active
- **AND** the user double-clicks the Dashboard map
- **THEN** the create-pivot modal does not open

### Requirement: Single click on existing pin shows details

The system SHALL keep single-click on an existing pin marker as the way to open that pin’s detail panel when offline center-selection mode is not active. While offline center-selection mode is active, single-click on a pin selects the offline center instead of opening the detail panel (see offline-map-download).

#### Scenario: Click existing pin

- **WHEN** the user single-clicks a pin marker on the map
- **AND** offline center-selection mode is not active
- **THEN** the detail panel for that pin opens
- **AND** the create-pivot modal does not open solely because of that single click

#### Scenario: Click pin during offline selection does not open detail

- **WHEN** offline center-selection mode is active
- **AND** the user single-clicks a pin marker on the map
- **THEN** the detail panel for that pin does not open solely because of that click
