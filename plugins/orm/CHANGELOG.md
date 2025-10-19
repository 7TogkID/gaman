# Changelog

## 1.1.0

### Changed
- Improved relation method implementation in BaseModel for better handling of asynchronous operations and parameter passing
- Refactored type definitions and generated declaration files for enhanced TypeScript support
- Updated tests to reflect changes in relation methods and overall functionality

## 1.0.0

### Added
- Initial release of the Gaman ORM plugin
- Core ORM class (`GamanORM`) for database operations via providers
- Base model class (`BaseModel`) with support for CRUD operations
- Automatic data type casting (int, float, string, boolean, json, datetime)
- Model relations: hasMany, belongsTo, hasOne
- SQLite provider implementation for database connectivity
- Sample models demonstrating usage and relations
