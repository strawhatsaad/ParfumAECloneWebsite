import { shopifyFetch } from "./shopify";

const GET_TESTER_PRODUCTS = `
  query getCollectionProducts($handle: String!) {
    collection(handle: $handle) {
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
            brand: metafield(namespace: "custom", key: "brand") {
              value
            }
            fragranceType: metafield(namespace: "custom", key: "fragrance_type") {
              value
            }
            gender: metafield(namespace: "custom", key: "gender") {
              value
            }
          }
        }
      }
    }
  }
`;

const GET_TESTER_BOX_VARIANT = `
  query getProductVariant($handle: String!) {
    product(handle: $handle) {
      variants(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

// Define a type for the product data coming from Shopify
type ProductEdge = {
  node: {
    id: string;
    title: string;
    handle: string;
    featuredImage: { url: string; altText: string };
    variants: { edges: { node: { id: string } }[] };
    brand?: { value: string };
    fragranceType?: { value: string };
    gender?: { value: string };
  };
};

export async function getTesterProductsAndFilters() {
  const collectionHandle = "tester-perfumes";
  const productHandle = "perfume-tester-box";

  const productsResponse = await shopifyFetch<{ collection: any }>({
    query: GET_TESTER_PRODUCTS,
    variables: { handle: collectionHandle },
  });

  if (!productsResponse.collection) {
    throw new Error(
      `Collection with handle "${collectionHandle}" not found. Please check the handle in your Shopify admin.`
    );
  }

  const testerBoxResponse = await shopifyFetch<{ product: any }>({
    query: GET_TESTER_BOX_VARIANT,
    variables: { handle: productHandle },
  });

  if (!testerBoxResponse.product) {
    throw new Error(
      `Product with handle "${productHandle}" not found. Please check the handle in your Shopify admin.`
    );
  }

  const products = productsResponse.collection.products.edges.map(
    (edge: ProductEdge) => ({
      ...edge.node,
      variantId: edge.node.variants.edges[0].node.id,
      brand: edge.node.brand?.value || null,
      fragranceType: edge.node.fragranceType?.value || null,
      gender: edge.node.gender?.value || null,
    })
  );

  const filters = {
    brands: [
      ...new Set(products.map((p) => p.brand).filter(Boolean)),
    ] as string[],
    fragranceTypes: [
      ...new Set(products.map((p) => p.fragranceType).filter(Boolean)),
    ] as string[],
    genders: [
      ...new Set(products.map((p) => p.gender).filter(Boolean)),
    ] as string[],
  };

  const testerBoxVariantId =
    testerBoxResponse.product.variants.edges[0]?.node.id;

  if (!testerBoxVariantId) {
    throw new Error(
      `The product "${productHandle}" does not have a variant. Please add one in Shopify.`
    );
  }

  return { products, filters, testerBoxVariantId };
}

const GET_PRODUCTS_BY_IDS = `
  query getProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
      }
    }
  }
`;

export async function getProductsByIds(ids: string[]) {
  const data = await shopifyFetch<{ nodes: any[] }>({
    query: GET_PRODUCTS_BY_IDS,
    variables: { ids },
  });
  // Filter out any null results if an ID was invalid
  return data.nodes.filter(Boolean);
}
