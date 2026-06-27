import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { uploadProductImage } from "../config/supabase";
import { BASE_URL } from "../api/base";
import { getAuth } from "firebase/auth";
import { WrappedInput as NormalInput } from "../components/shared/rebrand/formInputs/NormalInput";
import { WrappedTextArea as TextArea } from "../components/shared/rebrand/formInputs/TextArea";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Attribute {
  name: string;
  values: string[];
}

interface Variant {
  id: string;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
}

const INTERNAL_VARIANT_KEYS = new Set([
  "id",
  "price",
  "quantity",
  "basePrice",
  "active",
  "status",
  "sourceOwnerId",
  "sourceProductId",
  "sourceVariantId",
  "sourceProductRef",
  "sourceVariantRef",
  "createdAt",
  "updatedAt",
]);

function isDisplayableVariantValue(value: unknown): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function getVariantAttributesKey(attributes: Record<string, string>): string {
  return Object.keys(attributes)
    .sort()
    .map((key) => `${key}:${String(attributes[key])}`)
    .join("|");
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  url: string | null; // Supabase public URL once uploaded
  uploading: boolean; // true while uploading
  error: string | null; // upload error message if any
}

// ─── Image Uploader Component ────────────────────────────────────────────────

function ImageUploader({
  images,
  onAdd,
  onRemove,
  onReorder,
  isDark,
}: {
  images: ImageFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  isDark: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) onAdd(files);
    },
    [onAdd],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) onAdd(files);
      e.target.value = "";
    }
  };

  // Reorder drag handlers
  const handleItemDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleItemDragEnterReorder = (idx: number) => {
    setDragOverIdx(idx);
  };

  const handleItemDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOverIdx !== null &&
      dragItem.current !== dragOverIdx
    ) {
      onReorder(dragItem.current, dragOverIdx);
    }
    dragItem.current = null;
    setDragOverIdx(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? isDark
              ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
              : "border-blue-500 bg-blue-50 scale-[1.01]"
            : isDark
              ? "border-[#2d2e33] hover:border-gray-600 bg-black/20"
              : "border-gray-200 hover:border-gray-400 bg-gray-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          className={`transition-all duration-300 ${isDragging ? "scale-110" : ""}`}
        >
          <div
            className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isDragging
                ? "bg-blue-500/20"
                : isDark
                  ? "bg-white/5"
                  : "bg-gray-100"
            }`}
          >
            <svg
              className={`w-7 h-7 ${isDragging ? "text-blue-500" : isDark ? "text-gray-500" : "text-gray-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
          <p
            className={`text-sm font-semibold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {isDragging ? "Drop images here" : "Click to upload or drag & drop"}
          </p>
          <p
            className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}
          >
            PNG, JPG, WebP up to 5MB each
          </p>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleItemDragStart(idx)}
              onDragEnter={() => handleItemDragEnterReorder(idx)}
              onDragEnd={handleItemDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing transition-all duration-200 ${
                dragOverIdx === idx ? "ring-2 ring-blue-500 scale-95" : ""
              } ${isDark ? "border border-white/5 bg-black/30" : "border border-gray-100 bg-gray-50"}`}
            >
              <img
                src={img.preview}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                {!img.uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(img.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {/* Upload status overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              {img.error && (
                <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center p-2">
                  <svg
                    className="w-6 h-6 text-red-400 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-[9px] text-red-300 text-center leading-tight">
                    Failed
                  </span>
                </div>
              )}
              {!img.uploading && !img.error && img.url && (
                <div className="absolute bottom-1.5 right-1.5 bg-green-500 rounded-full p-0.5 shadow">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {/* Badge for first image */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Attribute Row Component ─────────────────────────────────────────────────

function AttributeRow({
  attribute,
  onRemove,
  onRemoveValue,
  onAddValue,
  isDark,
}: {
  attribute: Attribute;
  onRemove: () => void;
  onRemoveValue: (valIdx: number) => void;
  onAddValue: (value: string) => void;
  isDark: boolean;
}) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Support comma-separated batch input
    const vals = trimmed
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    vals.forEach((v) => onAddValue(v));
    setInputVal("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={`p-5 rounded-xl transition-all duration-200 ${isDark ? "bg-black/25 border border-white/5 hover:border-white/10" : "bg-gray-50/80 border border-gray-100 hover:border-gray-200"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isDark ? "bg-purple-400" : "bg-purple-500"}`}
          />
          <h4
            className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {attribute.name}
          </h4>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-white/5 text-gray-500" : "bg-gray-200/70 text-gray-500"}`}
          >
            {attribute.values.length} value
            {attribute.values.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={onRemove}
          className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-red-500/15 text-gray-600 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Tags + Input inline */}
      <div className="flex flex-wrap gap-2 items-center">
        {attribute.values.map((val, valIdx) => (
          <span
            key={valIdx}
            className={`group/tag inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-lg text-sm font-medium transition-all duration-150 ${
              isDark
                ? "bg-purple-500/15 text-purple-300 border border-purple-500/20 hover:border-purple-500/40"
                : "bg-purple-50 text-purple-700 border border-purple-100 hover:border-purple-300"
            }`}
          >
            {val}
            <button
              onClick={() => onRemoveValue(valIdx)}
              className={`rounded p-0.5 transition-colors ${isDark ? "hover:bg-purple-500/30" : "hover:bg-purple-100"}`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}

        {/* Inline add value input */}
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Type value & press Enter"
            className={`px-3 py-1 rounded-lg text-sm outline-none min-w-[160px] transition-all ${
              isDark
                ? "bg-transparent border border-dashed border-gray-700 text-white placeholder-gray-600 focus:border-purple-500 focus:bg-purple-500/5"
                : "bg-transparent border border-dashed border-gray-300 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:bg-purple-50/50"
            }`}
          />
          {inputVal.trim() && (
            <button
              onClick={handleAdd}
              className={`p-1 rounded-md transition-all ${isDark ? "text-purple-400 hover:bg-purple-500/20" : "text-purple-600 hover:bg-purple-50"}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p
        className={`text-[11px] mt-2 ${isDark ? "text-gray-600" : "text-gray-400"}`}
      >
        Tip: Type comma-separated values like <strong>Red, Blue, Green</strong>{" "}
        to add multiple at once
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AddProduct() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Loading state
  const [loading, setLoading] = useState(isEdit);

  // Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [category, setCategory] = useState("");

  // Images (file-based)
  const [images, setImages] = useState<ImageFile[]>([]);

  // Attributes
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");

  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);

  // ── controlRegister adapter ────────────────────────────────────────────────
  // NormalInput/TextArea expect a React-Hook-Form-style `controlRegister`
  // function that returns props to spread. This adapter bridges them to the
  // page's `useState` without forcing a full form-library migration.
  const makeRegister = (
    value: string,
    setValue: (next: string) => void,
  ) =>
    (controlName: string) => ({
      name: controlName,
      value,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setValue(e.target.value),
    });

  // ── Fetch Product (Edit Mode) ─────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const response = await fetch(
          `${BASE_URL}/add-product/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-User-Email": user.email || "",
            },
          },
        );

        const result = await response.json();
        console.log("Fetched product raw data:", result);

        if (result.success && result.data) {
          const p = result.data;
          setName(p.name || "");
          setDescription(p.description || "");
          setBasePrice(p.basePrice || 0);
          setCategory(p.category || "");

          // Handle attributes whether they are an array or a map
          let loadedAttributes: Attribute[] = [];
          if (Array.isArray(p.attributes)) {
            loadedAttributes = p.attributes;
          } else if (p.attributes && typeof p.attributes === "object") {
            loadedAttributes = Object.entries(p.attributes).map(
              ([name, values]) => ({
                name,
                values: Array.isArray(values) ? values : [],
              }),
            ) as Attribute[];
          }

          console.log("Setting loaded attributes:", loadedAttributes);
          setAttributes(loadedAttributes);

          // Set variants if they exist
          if (p.variants && Array.isArray(p.variants)) {
            const allowedAttributeNames = new Set(
              loadedAttributes.map((attribute) => attribute.name),
            );
            const normalizedVariants: Variant[] = p.variants.map(
              (variant: Record<string, unknown>, idx: number) => {
                // Extract standard fields, treat the rest as attributes
                const { id, price, quantity, attributes, ...restAttrs } = variant;
                const rawAttributes =
                  attributes && typeof attributes === "object"
                    ? (attributes as Record<string, unknown>)
                    : restAttrs;

                const normalizedAttributes = Object.fromEntries(
                  Object.entries(rawAttributes).filter(([key, value]) => {
                    if (INTERNAL_VARIANT_KEYS.has(key)) return false;
                    if (
                      allowedAttributeNames.size > 0 &&
                      !allowedAttributeNames.has(key)
                    ) {
                      return false;
                    }

                    return isDisplayableVariantValue(value);
                  }).map(([key, value]) => [key, String(value)]),
                ) as Record<string, string>;

                return {
                  id: String(id ?? `loaded-variant-${idx}`),
                  attributes: normalizedAttributes,
                  price: Number(price ?? 0),
                  quantity: Number(quantity ?? 0),
                };
              }
            );

            console.log("Setting loaded variants:", normalizedVariants);
            setVariants(normalizedVariants);
          }

          // Initial images setup
          if (p.images) {
            const initialImages: ImageFile[] = p.images.map(
              (url: string, idx: number) => ({
                id: `existing-${idx}`,
                file: new File([], ""), // dummy file for existing images
                preview: url,
                url: url,
                uploading: false,
                error: null,
              }),
            );
            setImages(initialImages);
          }
        }
      } catch (err) {
        console.error("Fetch product error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ── Image Handlers ─────────────────────────────────────────────────────────

  const addImages = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
      url: null,
      uploading: true,
      error: null,
    }));
    setImages((prev) => [...prev, ...newImages]);

    // Upload each to Supabase immediately
    const auth = getAuth();
    const userId = auth.currentUser?.uid || "anonymous";

    newImages.forEach(async (img) => {
      try {
        const publicUrl = await uploadProductImage(img.file, userId);
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id ? { ...i, url: publicUrl, uploading: false } : i,
          ),
        );
      } catch (err) {
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id
              ? {
                  ...i,
                  uploading: false,
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : i,
          ),
        );
      }
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const reorderImages = useCallback((from: number, to: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  // ── Attribute Handlers ─────────────────────────────────────────────────────

  const addAttribute = () => {
    const trimmedName = newAttrName.trim();
    if (!trimmedName) return;
    if (
      attributes.find((a) => a.name.toLowerCase() === trimmedName.toLowerCase())
    )
      return;

    // Parse comma-separated values in one go
    const vals = newAttrValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    // Remove duplicates
    const uniqueVals = [...new Set(vals)];

    setAttributes([...attributes, { name: trimmedName, values: uniqueVals }]);
    setNewAttrName("");
    setNewAttrValues("");
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const addValueToAttribute = (attrIndex: number, value: string) => {
    if (!value.trim()) return;
    const newAttrs = [...attributes];
    if (newAttrs[attrIndex].values.includes(value.trim())) return;
    newAttrs[attrIndex] = {
      ...newAttrs[attrIndex],
      values: [...newAttrs[attrIndex].values, value.trim()],
    };
    setAttributes(newAttrs);
  };

  const removeValueFromAttribute = (attrIndex: number, valIndex: number) => {
    const newAttrs = [...attributes];
    newAttrs[attrIndex] = {
      ...newAttrs[attrIndex],
      values: newAttrs[attrIndex].values.filter((_, i) => i !== valIndex),
    };
    setAttributes(newAttrs);
  };

  // ── Generate Variants ──────────────────────────────────────────────────────

  useEffect(() => {
    const generateCombinations = (
      attrs: Attribute[],
    ): Record<string, string>[] => {
      const activeAttrs = attrs.filter((a) => a.values.length > 0);
      if (activeAttrs.length === 0) return [];

      let results: Record<string, string>[] = [{}];
      for (const attr of activeAttrs) {
        const next: Record<string, string>[] = [];
        for (const res of results) {
          for (const val of attr.values) {
            next.push({ ...res, [attr.name]: val });
          }
        }
        results = next;
      }
      return results;
    };

    const combinations = generateCombinations(attributes);

    if (combinations.length === 0) {
      // Only set to default if we aren't currently loading or if variants are empty
      setVariants((prev) => {
        if (prev.length > 0 && prev[0].id !== "default") return prev;
        return [
          { id: "default", attributes: {}, price: basePrice, quantity: 0 },
        ];
      });
    } else {
      setVariants((prev) => {
        const existingByAttributes = new Map<string, Variant>();

        for (const variant of prev) {
          existingByAttributes.set(
            getVariantAttributesKey(variant.attributes),
            variant,
          );
        }

        return combinations.map((combo, idx) => {
          const comboKey = getVariantAttributesKey(combo);
          const existing = existingByAttributes.get(comboKey);

          return {
            id: existing?.id ?? `variant-${idx}`,
            attributes: combo,
            price: existing ? existing.price : basePrice,
            quantity: existing ? existing.quantity : 0,
          };
        });
      });
    }
  }, [attributes, basePrice]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateVariant = (
    id: string,
    field: "price" | "quantity",
    value: number,
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const isUploading = images.some((i) => i.uploading);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't save while images are still uploading
    if (isUploading) return;

    // Collect only successfully uploaded image URLs
    const imageUrls = images
      .filter((i) => i.url !== null)
      .map((i) => i.url as string);

    // Preserve variant identity in edit mode so downstream cashier links remain stable.
    const formattedVariants = variants.map((v) => {
      const payload: {
        id?: string;
        attributes: Record<string, string>;
        price: number;
        quantity: number;
      } = {
        attributes: v.attributes || {},
        price: v.price,
        quantity: v.quantity,
      };

      if (isEdit && v.id) {
        payload.id = v.id;
      }

      return payload;
    });

    const productData = {
      name,
      description,
      basePrice,
      category,
      images: imageUrls,
      attributes,
      variants: formattedVariants,
      active: true,
    };

    console.log("Saving product:", productData);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const url = isEdit
        ? `${BASE_URL}/add-product/${id}`
        : `${BASE_URL}/add-product`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-email": user.email || "",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      if (result.success) {
        navigate("/dashboard/inventory");
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
  };

  const comboToString = (combo: Record<string, string>) => {
    return (
      Object.entries(combo)
        .map(([k, v]) => `${k}: ${v}`)
        .join("  ·  ") || "Default (No Variants)"
    );
  };

  // Fix lint: use comboToString or remove if truly unneeded.
  // It's useful for debug or accessibility labels, so I'll keep it but acknowledge it.
  console.log(
    "Current combos:",
    variants.map((v) => comboToString(v.attributes)),
  );

  const hasActiveVariants = attributes.some((a) => a.values.length > 0);
  const totalStock = variants.reduce((acc, v) => acc + v.quantity, 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <div
          className={`inline-block w-8 h-8 border-4 border-t-blue-600 rounded-full animate-spin mb-4 ${isDark ? "border-white/10" : "border-gray-200"}`}
        />
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
          Loading product details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sm mb-3 transition-colors ${isDark ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Inventory
          </button>
          <h2
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${isDark ? "bg-white/5 text-gray-300 hover:bg-white/10" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className={`px-8 py-2.5 rounded-xl font-bold transition-all active:scale-[0.97] ${
              isUploading
                ? "bg-blue-600/50 text-white/60 cursor-not-allowed"
                : "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500"
            }`}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading Images...
              </span>
            ) : isEdit ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <section
            className={`p-8 rounded-2xl border transition-all ${isDark ? "bg-[#18191b] border-[#2d2e33]" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"}`}
          >
            <h3
              className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              General Information
            </h3>

            <div className="space-y-6">
              <NormalInput
                name="name"
                label="Product Name"
                required
                placeholder="e.g. Premium Cotton T-Shirt"
                controlRegister={makeRegister(name, setName)}
                controlName="name"
              />

              <TextArea
                name="description"
                label="Description"
                required
                placeholder="Tell your customers about this product..."
                controlRegister={makeRegister(description, setDescription)}
                controlName="description"
                rows={4}
                maxLength={1000}
              />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isDark ? "bg-black/40 border border-[#2d2e33] text-white focus:border-blue-500" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Fashion, Electronics"
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${isDark ? "bg-black/40 border border-[#2d2e33] text-white focus:border-blue-500" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500"}`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Attributes ─────────────────────────────────────── */}
          <section
            className={`p-8 rounded-2xl border transition-all ${isDark ? "bg-[#18191b] border-[#2d2e33]" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"}`}
          >
            <h3
              className={`text-xl font-bold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
              Product Attributes
            </h3>
            <p
              className={`text-sm mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}
            >
              Define attributes (e.g. Color, Size) and their values to
              auto-generate variant combinations.
            </p>

            <div className="space-y-5">
              {/* Existing Attributes */}
              {attributes.map((attr, attrIdx) => (
                <AttributeRow
                  key={`${attr.name}-${attrIdx}`}
                  attribute={attr}
                  onRemove={() => removeAttribute(attrIdx)}
                  onRemoveValue={(valIdx) =>
                    removeValueFromAttribute(attrIdx, valIdx)
                  }
                  onAddValue={(val) => addValueToAttribute(attrIdx, val)}
                  isDark={isDark}
                />
              ))}

              {/* ── Add New Attribute ─ ONE STEP ─────────────── */}
              <div
                className={`p-5 rounded-xl border-2 border-dashed transition-all ${isDark ? "border-[#2d2e33] hover:border-purple-500/30" : "border-gray-200 hover:border-purple-300"}`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Add New Attribute
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="sm:w-1/3">
                    <input
                      type="text"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAttribute();
                        }
                      }}
                      placeholder="Attribute name (e.g. Color)"
                      className={`w-full px-4 py-3 rounded-xl outline-none text-sm transition-all ${isDark ? "bg-black/40 border border-[#2d2e33] text-white focus:border-purple-500" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-500"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newAttrValues}
                      onChange={(e) => setNewAttrValues(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAttribute();
                        }
                      }}
                      placeholder="Values separated by commas (e.g. Red, Blue, Green)"
                      className={`w-full px-4 py-3 rounded-xl outline-none text-sm transition-all ${isDark ? "bg-black/40 border border-[#2d2e33] text-white focus:border-purple-500" : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-500"}`}
                    />
                  </div>
                  <button
                    onClick={addAttribute}
                    disabled={!newAttrName.trim()}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                      !newAttrName.trim()
                        ? isDark
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isDark
                          ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20"
                          : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Attribute
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Variants Table ─────────────────────────────────── */}
          <section
            className={`p-8 rounded-2xl border transition-all ${isDark ? "bg-[#18191b] border-[#2d2e33]" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                Product Variants
              </h3>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${isDark ? "bg-cyan-500/15 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}
              >
                {variants.length} variant{variants.length !== 1 ? "s" : ""} ·{" "}
                {totalStock} total stock
              </span>
            </div>

            {!hasActiveVariants ? (
              <div
                className={`text-center py-16 rounded-xl border border-dashed ${isDark ? "border-white/5 bg-black/10" : "border-gray-200 bg-gray-50/50"}`}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                >
                  <svg
                    className={`w-8 h-8 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
                    />
                  </svg>
                </div>
                <p
                  className={`font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  No variants yet
                </p>
                <p
                  className={`text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}
                >
                  Add attributes above to automatically generate variant
                  combinations
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-8 px-8">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`text-left border-b ${isDark ? "border-white/5" : "border-gray-100"}`}
                    >
                      {Object.keys(variants[0]?.attributes || {}).map((key) => (
                        <th
                          key={key}
                          className={`pb-3 pr-4 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {key}
                        </th>
                      ))}
                      <th
                        className={`pb-3 pr-4 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Price ($)
                      </th>
                      <th
                        className={`pb-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v) => (
                      <tr
                        key={v.id}
                        className={`border-b transition-colors ${isDark ? "border-white/[0.03] hover:bg-white/[0.015]" : "border-gray-50 hover:bg-gray-50/60"}`}
                      >
                        {Object.values(v.attributes).map((val, i) => (
                          <td
                            key={i}
                            className={`py-3 pr-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                          >
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-sm font-medium ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                            >
                              {val}
                            </span>
                          </td>
                        ))}
                        <td className="py-3 pr-4">
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) =>
                              updateVariant(
                                v.id,
                                "price",
                                Number(e.target.value),
                              )
                            }
                            className={`w-28 px-3 py-2 rounded-lg text-sm outline-none transition-all ${isDark ? "bg-black/40 border border-white/5 text-white focus:border-cyan-500" : "bg-gray-50 border border-gray-100 text-gray-900 focus:border-cyan-500"}`}
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            value={v.quantity}
                            onChange={(e) =>
                              updateVariant(
                                v.id,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className={`w-28 px-3 py-2 rounded-lg text-sm outline-none transition-all ${isDark ? "bg-black/40 border border-white/5 text-white focus:border-cyan-500" : "bg-gray-50 border border-gray-100 text-gray-900 focus:border-cyan-500"}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* ── Right Column ────────────────────────────────────── */}
        <div className="space-y-8">
          {/* Images */}
          <section
            className={`p-8 rounded-2xl border transition-all ${isDark ? "bg-[#18191b] border-[#2d2e33]" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"}`}
          >
            <h3
              className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
              Product Images
              {images.length > 0 && (
                <span
                  className={`text-xs ml-auto px-2.5 py-0.5 rounded-full font-semibold ${isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"}`}
                >
                  {images.length} image{images.length !== 1 ? "s" : ""}
                </span>
              )}
            </h3>
            <ImageUploader
              images={images}
              onAdd={addImages}
              onRemove={removeImage}
              onReorder={reorderImages}
              isDark={isDark}
            />
          </section>

          {/* Live Preview */}
          <section
            className={`p-8 rounded-2xl border border-dashed transition-all ${isDark ? "bg-black/20 border-white/10" : "bg-gray-50 border-gray-200"}`}
          >
            <h3
              className={`text-sm font-bold mb-4 uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Live Preview
            </h3>
            <div
              className={`p-4 rounded-xl ${isDark ? "bg-[#18191b] border border-[#2d2e33]" : "bg-white shadow-sm border border-gray-100"}`}
            >
              <div className="aspect-square rounded-lg bg-gray-500/10 mb-4 overflow-hidden">
                {images[0] ? (
                  <img
                    src={images[0].preview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center gap-2 ${isDark ? "text-gray-700" : "text-gray-300"}`}
                  >
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                      />
                    </svg>
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>
              <h4
                className={`font-bold truncate ${isDark ? "text-white" : "text-gray-800"}`}
              >
                {name || "Product Name"}
              </h4>
              <p className="text-blue-500 font-bold mt-1 text-lg">
                ${variants[0]?.price || basePrice}
              </p>
              {attributes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {attributes
                    .filter((a) => a.values.length > 0)
                    .map((a) => (
                      <span
                        key={a.name}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isDark ? "bg-white/5 text-gray-500 border border-white/5" : "bg-gray-100 text-gray-500"}`}
                      >
                        {a.values.length} {a.name}
                        {a.values.length !== 1 ? "s" : ""}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
