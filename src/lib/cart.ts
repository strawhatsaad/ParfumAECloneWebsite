import { shopifyFetch } from "./shopify";

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          product: {
            title: string;
            featuredImage: {
              url: string;
              altText: string;
            };
          };
          price: {
            amount: string;
            currencyCode: string;
          };
        };
      };
    }[];
  };
};

const CART_FRAGMENT = `
  id
  checkoutUrl
  cost {
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              title
              featuredImage {
                url
                altText
              }
            }
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

type Product = {
  id: string;
  variantId: string;
  title: string;
};

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
       ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function addBundleToCart(
  cartId: string | null,
  testerBoxVariantId: string,
  bundleItems: Product[]
): Promise<ShopifyCart> {
  const lineItemProperties = bundleItems.map((item, index) => ({
    key: `Tester ${index + 1}`,
    value: item.title,
  }));

  const line = {
    merchandiseId: testerBoxVariantId,
    quantity: 1,
    attributes: lineItemProperties,
  };

  if (cartId) {
    const data = await shopifyFetch<{
      cartLinesAdd: { cart: ShopifyCart; userErrors: any[] };
    }>({
      query: ADD_TO_CART_MUTATION,
      variables: { cartId, lines: [line] },
    });
    if (data.cartLinesAdd.userErrors?.length) {
      throw new Error(data.cartLinesAdd.userErrors[0].message);
    }
    return data.cartLinesAdd.cart;
  } else {
    const data = await shopifyFetch<{
      cartCreate: { cart: ShopifyCart; userErrors: any[] };
    }>({
      query: CREATE_CART_MUTATION,
      variables: { input: { lines: [line] } },
    });
    if (data.cartCreate.userErrors?.length) {
      throw new Error(data.cartCreate.userErrors[0].message);
    }
    return data.cartCreate.cart;
  }
}

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FRAGMENT}
    }
  }
`;

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart }>({
    query: GET_CART_QUERY,
    variables: { cartId },
  });
  return data.cart;
}

const REMOVE_FROM_CART_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FRAGMENT}
      }
       userErrors {
        field
        message
      }
    }
  }
`;

export async function removeFromCart(
  cartId: string,
  lineId: string
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart; userErrors: any[] };
  }>({
    query: REMOVE_FROM_CART_MUTATION,
    variables: {
      cartId,
      lineIds: [lineId],
    },
  });
  if (data.cartLinesRemove.userErrors?.length) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }
  return data.cartLinesRemove.cart;
}
