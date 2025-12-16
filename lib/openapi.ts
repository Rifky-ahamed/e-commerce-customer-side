import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "./zod-setup";
import {
  CartProductsSchema,
  CartProductSchema,
  CartProductsResponseSchema,
  CheckoutSchema,
  CheckoutResponseSchema,
  ProductsByIdRequestSchema,
  ProductsByIdResponseSchema,
  ProductSchema
} from "./schemas";

export const registry = new OpenAPIRegistry();

// Optional but recommended error schema
const ErrorSchema = z.object({
  error: z.string(),
});

// Register schemas
registry.register("CartProductsRequest", CartProductsSchema);
registry.register("CartProduct", CartProductSchema);
registry.register("CartProductsResponse", CartProductsResponseSchema);
registry.register("CheckoutRequest", CheckoutSchema);
registry.register("CheckoutResponse", CheckoutResponseSchema);
registry.register("ProductsByIdRequest", ProductsByIdRequestSchema);
registry.register("Product", ProductSchema);
registry.register("ProductsByIdResponse", ProductsByIdResponseSchema);



// Register Cart API path
registry.registerPath({
  method: "post",
  path: "/api/cart",
  summary: "Get cart products",
  description: "Fetch product details for cart using product IDs",
  tags: ["Cart"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CartProductsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Cart products fetched successfully",
      content: {
        "application/json": {
          schema: CartProductsResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/checkout",
  summary: "Checkout",
  description: "Create an order from cart items",
  tags: ["Checkout"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CheckoutSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Order placed successfully",
      content: {
        "application/json": {
          schema: CheckoutResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/products/by-id",
  summary: "Get products by ID",
  description: "Fetch product details using a list of product IDs",
  tags: ["Products"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProductsByIdRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Products fetched successfully",
      content: {
        "application/json": {
          schema: ProductsByIdResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});


// Generate OpenAPI document
export function getApiDocs() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
    },
  });
}
