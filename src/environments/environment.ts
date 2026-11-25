/**
 * Configuración de producción. La API se sirve desde el mismo dominio del panel, con HTTPS
 * (RNF-02, RNF-12); así el panel no depende de una URL escrita en el código.
 */
export const environment = {
  apiUrl: '/api/v1',
};
