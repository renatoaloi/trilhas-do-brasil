## Purpose

Allows users to navigate from the pivots list page to the map, centering the map on a selected pivot so they can see its geographic context.

## Requirements

### Requirement: "Ver no Mapa" button on pivot cards

Each pivot card in the pivots list page SHALL display a "Ver no Mapa" button that navigates the user to the map page with that pivot's coordinates.

#### Scenario: User clicks "Ver no Mapa"

- **WHEN** user clicks the "Ver no Mapa" button on a pivot card
- **THEN** the application navigates to the map page
- **AND** the map centers and animates to the pivot's latitude and longitude
- **AND** the map loads pivots for the new visible area

#### Scenario: Normal map navigation is unaffected

- **WHEN** user navigates to the map page via sidebar or direct URL without pivot coordinates
- **THEN** the map behaves as before (geolocation fallback, then Brasilia default)
