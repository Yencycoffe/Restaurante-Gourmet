# Estructura de "Base de Datos" (LocalStorage) 🗄️

Gourmet Express utiliza un sistema de almacenamiento basado en el navegador (`localStorage`) para garantizar rapidez y funcionamiento offline.

## Esquemas de Datos (JSON)

### 1. Platillos (`rest_dishes`)
Almacena el catálogo de productos disponible en el restaurante.
```json
[
  {
    "id": 123456,
    "name": "Nombre del plato",
    "description": "Descripción detallada",
    "price": 42000,
    "category": "Entradas | Platos Fuertes | Bebidas | Postres",
    "image": "URL de la imagen"
  }
]
```

### 2. Pedidos (`rest_orders`)
Almacena el histórico de pedidos generados.
```json
[
  {
    "id": 1715380000000,
    "customer": "Nombre del Cliente",
    "nit": "12345678-9",
    "table": "Mesa 5",
    "items": [ ...copia de objetos del carrito... ],
    "total": 54500,
    "status": "Pendiente | Preparando | Listo | Entregado",
    "date": "2026-05-10T22:00:00Z"
  }
]
```

### 3. Clientes (`rest_customers`)
Base de datos de clientes frecuentes guardados para facturación rápida.
```json
[
  {
    "id": 1715380000000,
    "name": "Juan Perez",
    "nit": "900.123.456-1",
    "email": "juan@example.com",
    "phone": "3001234567"
  }
]
```

### 4. Control de Versión (`rest_vXX`)
Se utiliza una llave booleana (ej. `rest_v25: true`) para identificar la versión de la aplicación y forzar la limpieza de caché cuando se actualizan datos críticos o estructurales.
