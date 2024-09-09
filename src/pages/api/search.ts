import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  // Define the structure of your API response here
  // This is just an example, adjust according to your actual API response
  [key: string]: any;
};

type ErrorResponse = {
  error: string;
};

export default async function searchHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>,
) {
  const { postal_code, q } = req.query;

  if (typeof postal_code !== "string" || typeof q !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    console.log(process.env.API_BASE_URL);
    const apiUrl = new URL("/bf/flipp/items/search", process.env.API_BASE_URL);
    apiUrl.searchParams.append("postal_code", postal_code);
    apiUrl.searchParams.append("q", q);
    apiUrl.searchParams.append("locale", "en_us");

    console.log(apiUrl.toString());
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: Data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("API request failed:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
