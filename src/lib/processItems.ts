export async function processItems(items: any[], postal_code: string) {
  const results = await Promise.all(
    items
      .filter((item) => item.name !== null)
      .map(async (item: any) => {
        const apiUrl = new URL(
          `/api/flipp/flyer_items/${item.flyer_item_id}`,
          process.env["API_BASE_URL"],
        );
        apiUrl.searchParams.append("postal_code", postal_code);
        apiUrl.searchParams.append("locale", "en");

        const response = await fetch(apiUrl.toString());
        const {
          description,
          pre_price_text,
          price_text,
          current_price,
          original_price,
          merchant,
          disclaimer_text,
          flyer_disclaimer_text,
          flyer_valid_from,
          flyer_valid_to,
        } = await response.json();

        const prePriceText = pre_price_text === null ? "" : pre_price_text;
        const priceText = price_text === null ? "" : price_text;
        const desc = description === null ? "" : description;

        const currentPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(current_price);

        const price_description =
          `${prePriceText} ${currentPrice} ${priceText}/${desc}`
            .replace(/\s+/g, " ")
            .trim();

        return {
          name: item.name,
          flyer_item_id: item.flyer_item_id,
          description,
          pre_price_text,
          price_text,
          current_price,
          original_price,
          price_description,
          merchant,
          disclaimer_text,
          flyer_disclaimer_text,
          flyer_valid_from,
          flyer_valid_to,
        };
      }),
  );

  return results;
}
