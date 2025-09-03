# Reference Projects

This directory contains reference implementations and prototypes that will be integrated into the main OEA system.

## Management Hub

The `management-hub/` directory contains the complete management hub implementation with:

- **Overview Page**: Network-wide YMCA performance visualization
- **Detail Views**: Individual YMCA analytics and metrics
- **Interactive Components**: Treemap, table, and map views
- **Styling System**: Complete CSS framework with color palettes

### Integration Plan

This reference implementation will be converted to React components and integrated into the main Next.js frontend under:
- `/frontend/src/app/analytics/` - Analytics dashboard pages
- `/frontend/src/app/management/` - Management hub pages
- `/frontend/src/components/analytics/` - Analytics components
- `/frontend/src/components/management/` - Management components

### Key Features to Migrate

1. **Performance Cards**: YMCA association performance overview
2. **Analytics Dashboard**: Detailed metrics and charts
3. **Navigation System**: View switching and organization selection
4. **Color Themes**: YMCA branding and color palettes
5. **Interactive Visualizations**: Treemap, charts, and data displays
