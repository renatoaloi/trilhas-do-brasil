## Purpose

Permite ao usuário autenticado baixar pinos para uso offline escolhendo um pino no mapa como centro da busca por raio, com pré-visualização do raio e ajuste fino de coordenadas.

## ADDED Requirements

### Requirement: Offline button enters center selection mode

When the user activates Offline on the Dashboard, the system SHALL enter a center-selection mode that prompts the user to click a pin on the map, with a visible instruction and a way to cancel the mode without downloading.

#### Scenario: Enter selection mode

- **WHEN** the user activates the Offline control on the Dashboard
- **THEN** the system enters center-selection mode
- **AND** shows an instruction to click a pin as the download center
- **AND** offers a cancel action that exits the mode without downloading

#### Scenario: Cancel selection mode

- **WHEN** the user is in center-selection mode
- **AND** the user cancels
- **THEN** the mode ends
- **AND** normal map interactions resume
- **AND** no offline download is performed solely because of cancel

### Requirement: Click pin selects offline center

While center-selection mode is active, a single click on a pin marker SHALL select that pin as the offline download center and open the offline download form prefilled from that pin’s coordinates.

#### Scenario: Select center pin

- **WHEN** center-selection mode is active
- **AND** the user single-clicks a pin marker
- **THEN** that pin becomes the offline center
- **AND** the offline download form opens with latitude and longitude set from the pin
- **AND** the pin detail panel does not open for that click

### Requirement: Offline form keeps editable coordinates and radius

The offline download form SHALL show the selected center identity (e.g. pin name), allow editing latitude and longitude, and require a radius in km before download. Manual coordinate entry without first selecting a pin is not required as the primary path.

#### Scenario: Prefill and edit after pin selection

- **WHEN** the offline form was opened after selecting a center pin
- **THEN** latitude and longitude are prefilled from the pin
- **AND** the user can edit latitude, longitude, and radius before downloading

#### Scenario: Download uses submitted values

- **WHEN** the user confirms download with valid latitude, longitude, and radius
- **THEN** the system requests offline pins for those center coordinates and radius
- **AND** stores the result for offline use (e.g. localStorage) as today

### Requirement: Radius circle preview on map

While the offline center is defined (form open and/or center selected with radius), the map SHALL display a circle centered on the current latitude/longitude with radius matching the current radius value in kilometers, updating when those values change.

#### Scenario: Circle follows radius and center edits

- **WHEN** an offline center and radius are set
- **AND** the user changes radius or latitude/longitude in the form
- **THEN** the map circle updates to match the new center and radius

#### Scenario: Circle cleared when offline flow ends

- **WHEN** the user closes the offline form and exits center-selection mode (cancel or after finishing)
- **THEN** the radius circle is no longer shown on the map

### Requirement: Empty map guidance

If the user enters center-selection mode and no pins are available on the map to select, the system SHALL inform the user that they need pins visible (e.g. navigate/filter) rather than failing silently.

#### Scenario: No pins visible

- **WHEN** the user enters center-selection mode
- **AND** there are no pin markers available to click
- **THEN** the system shows guidance that a visible pin is needed to choose a center
