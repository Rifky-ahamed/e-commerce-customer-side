"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function UploadProductPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("id, name");
      if (error) console.error("Failed to fetch categories:", error);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  if (!authLoading && (!user || !isAdmin)) {
    return <p className="p-8 text-center text-red-600">Access denied. Only admin can upload products.</p>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!isAdmin) return toast.error("You are not authorized");
    if (!file) return toast.error("Please select an image file");

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock || "0", 10);

    if (!productName || numericPrice <= 0 || isNaN(numericPrice) || !selectedCategory) {
      return toast.error("Please fill all fields correctly");
    }

    setLoading(true);

    try {
      
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          description,
          price: numericPrice,
          stock: numericStock,
          category_id: selectedCategory,
          image_file_name: fileName,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      toast.success("Product uploaded successfully!");
      setProductName("");
      setDescription("");
      setPrice("");
      setStock("");
      setFile(null);
      setSelectedCategory(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload product");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <p className="p-8 text-center">Checking login status...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Product (Admin)</h1>

      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
        <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} className="border p-2 rounded-md" />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded-md" />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded-md" />
        <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="border p-2 rounded-md" />
        <select value={selectedCategory || ""} onChange={(e) => setSelectedCategory(Number(e.target.value))} className="border p-2 rounded-md">
          <option value="">Select Category</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 rounded-md" />
        <Button onClick={handleUpload} disabled={loading}>{loading ? "Uploading..." : "Upload Product"}</Button>
      </div>
    </div>
  );
}
