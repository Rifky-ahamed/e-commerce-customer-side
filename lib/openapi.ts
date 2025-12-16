import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "./zod-setup"; // ✅ REQUIRED
import {
  CartProductsSchema,
  CartProductSchema,
  CartProductsResponseSchema,
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
