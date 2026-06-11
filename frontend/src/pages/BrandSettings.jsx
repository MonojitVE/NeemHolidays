import { useEffect, useState } from "react";
import api from "../api/client";

export default function BrandSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBrand = async () => {
    try {
      const res = await api.get("/brand/");
      setForm(res.data || {});
    } catch (error) {
      console.error("Failed to load brand settings:", error);
      setForm({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrand();
  }, []);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const save = async () => {
    try {
      await api.put("/brand/", form);
      alert("Brand settings saved successfully");
    } catch (error) {
      console.error("Failed to save brand settings:", error);
      alert("Failed to save brand settings");
    }
  };

  if (loading) {
    return <p>Loading brand settings...</p>;
  }

  const fields = [
    "brand_name",
    "primary_color",
    "secondary_color",
    "font_style",
    "tone_of_voice",
    "cta_format",
    "social_style",
  ];

  return (
    <>
      <h1>Brand Settings</h1>

      <div className="card formgrid">
        {fields.map((field) => (
          <label key={field}>
            {field.replaceAll("_", " ")}

            <input
              name={field}
              value={form?.[field] || ""}
              onChange={update}
              type={
                field === "primary_color" || field === "secondary_color"
                  ? "color"
                  : "text"
              }
            />
          </label>
        ))}

        <button onClick={save}>Save Brand</button>
      </div>
    </>
  );
}