type GraphQLResponse = {
  data?: any;
  errors?: { message: string }[];
};

export async function shopifyFetch<T>({
  query,
  variables = {},
  revalidate,
}: {
  query: string;
  variables?: Record<string, any>;
  revalidate?: number;
}): Promise<T> {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-04/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });

    const body = (await result.json()) as GraphQLResponse;

    if (body.errors) {
      throw body.errors[0];
    }

    return body.data;
  } catch (e) {
    console.error("GraphQL Fetch Error:", e);
    throw {
      status: 500,
      message: "Error receiving data from Shopify",
    };
  }
}
