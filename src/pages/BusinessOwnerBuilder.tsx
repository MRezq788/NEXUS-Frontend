import { useState, useEffect } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "../components/builder/config";
import { saveWebsiteLayout, getWebsiteLayout } from "../services/builder.api";

const initialData: Data = { content: [], root: {} };

export default function BusinessOwnerBuilder() {
  const [data, setData] = useState<Data>(initialData);
  const businessId = "demo-business-123"; 

  useEffect(() => {
    getWebsiteLayout(businessId).then((savedData) => {
      if (savedData) setData(savedData);
    });
  }, [businessId]);

  const handlePublish = async (newLayoutData: Data) => {
    await saveWebsiteLayout(businessId, newLayoutData);
    alert("Website published successfully!");
  };

  return (
    <div className="h-screen w-full">
      <Puck 
        config={config} 
        data={data} 
        onPublish={handlePublish} 
      />
    </div>
  );
}