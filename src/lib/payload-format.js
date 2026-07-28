export function formatPayloadComponents(components) {
  return components
    .map((component) => component.charAt(0).toUpperCase() + component.slice(1))
    .join(' + ');
}
