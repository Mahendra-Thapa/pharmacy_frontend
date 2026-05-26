"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Search, Database, X } from "lucide-react";
import { axiosInstance } from "@/utils/axiosSetup";

const SearchComponent = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await axiosInstance.get('/medicines/');
        setMedicines(res.data);
      } catch (err) {
        console.error("Search fetch failed");
      }
    };
    fetchMedicines();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (med.category_name && med.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 8); // Limit results

  return (
    <div
      className={`${
        isFocused
          ? "absolute w-[90vw] md:relative md:w-full z-50 left-0 right-0 mx-auto px-4 md:px-0"
          : "ml-auto w-full group"
      }`}
    >
      <div className="flex md:gap-4 items-center relative w-full">
        <div
          className={`${
            isFocused && "flex ring-4 ring-emerald-500/10 border-emerald-500/30"
          } ${isFocused && searchQuery.length > 0 ? "rounded-b-none rounded-t-[24px]" : ""
            } flex items-center p-1 bg-slate-50 border border-slate-200 rounded-full dark:bg-black ml-auto transition-all duration-300 ${
            isFocused ? "w-full bg-white" : "w-10 sm:w-full hover:border-slate-300"
          }`}
        >
          <div className={`p-2 ${isFocused ? 'text-emerald-500' : 'text-slate-400'}`}>
            <Search size={18} strokeWidth={isFocused ? 3 : 2} />
          </div>
          <input
            id="searchInput"
            name="searchInput"
            type="text"
            onChange={handleChange}
            placeholder="Search medicines, categories..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            value={searchQuery}
            className={`text-sm bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium transition-all ${
              isFocused ? "w-full" : "w-0 sm:w-full"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredMedicines.length > 0) {
                router.push(`/medicine/${filteredMedicines[0].id}`);
                setIsFocused(false);
              }
            }}
          />
          {isFocused && (
             <button onClick={() => setSearchQuery("")} className="p-2 text-slate-300 hover:text-slate-500">
                <X size={14} />
             </button>
          )}
        </div>

        {isFocused && searchQuery.length > 0 && (
          <Card
            className="absolute h-max max-h-[60vh] w-full flex flex-col top-full left-0 mt-0 px-2 py-3 rounded-t-none rounded-b-[24px] overflow-y-auto scrollbar-thin shadow-2xl border-t-0 bg-white/95 backdrop-blur-xl z-[60]"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2 font-sans">
                Found {filteredMedicines.length} matches
            </div>
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((med) => (
                <div
                  key={med.id}
                  className="flex gap-4 p-3 rounded-2xl items-center hover:bg-emerald-50 cursor-pointer transition-colors group/item"
                  onClick={() => {
                    router.push(`/medicine/${med.id}`);
                    setSearchQuery("");
                    setIsFocused(false);
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {med.image_url ? (
                      <Image
                        src={med.image_url}
                        fill
                        alt={med.name}
                        className="object-cover"
                      />
                    ) : (
                      <Database size={18} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-col text-sm leading-tight space-y-0.5 flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate group-hover/item:text-emerald-600 transition-colors uppercase tracking-tight">
                      {med.name}
                    </p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       Rs. {parseFloat(med.price).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{med.category_name || "General Medicine"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Search size={20} />
                 </div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching medicines found.</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
