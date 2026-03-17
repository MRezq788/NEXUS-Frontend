import type { Data } from "@puckeditor/core";

export const saveWebsiteLayout = async (businessId: string, layoutData: Data) => {
  console.log("Saving layout for", businessId, layoutData);
  return true;
};

export const getWebsiteLayout = async (businessId: string): Promise<Data | null> => {
  console.log("Fetching layout for", businessId);
  return null; 
};