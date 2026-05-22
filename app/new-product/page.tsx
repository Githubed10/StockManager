"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "@/type";
import { createProduct, readCategories } from "../actions";
import { FileImage } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Page = () => {
  
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
    imageUrl: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value })
  }
   useEffect(() => {
      const fetchCategories = async () => { 
        try {
       if (email) {
           const data = await readCategories(email)
           if (data)
            setCategories(data)
           }
      } catch (error){
        console.error("Erreur lors du changement des catégorie", error)
      }
    }
    fetchCategories()
    }, [email])


    const handleFileChange = (e : React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null
      setFile(selectedFile)
      if(selectedFile){
        setPreviewUrl(URL.createObjectURL(selectedFile))
      } 
    }
    const handleSubmit = async () => {
      if(!file){
        toast.error("Veuillez sélectionner une image.")
        return
      }
      try {

        const imageData = new FormData()
          imageData.append("file", file)
          const res = await fetch("/api/upload", {
            method: "POST",
            body: imageData
          })
          const data = await res.json()
          if(!data.success){
            throw new Error("Erreur lors de l'upload de l'image.")
          }else {
            formData.imageUrl = data.path
            await createProduct(
              formData , email
            )
            toast.success("Article créé avec succe&aposs.")
            router.push("/products")
          }

      } catch (error){
        console.log(error)
        toast.error("Il y a une erreur.")
      }
    }

  return (
    <Wrapper>
      <div className="flex justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Créer un article</h1>
          <section className="flex md:flex-row flex-col">
            <div className="space-y-4 md:w-[450px]">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
              />
              <textarea
                name="description"
                placeholder="Description"
                className="textarea textarea-bordered w-full"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              
              <input
                type="number"
                name="price"
                placeholder="Prix"
                className="input input-bordered w-full"
                value={formData.price}
                onChange={handleChange}
                
              />
              <label htmlFor="categoryId" className="block mb-1 font-medium">
                Catégorie
              </label>
              <select
                
                className="select select-bordered w-full"
                value={formData.categoryId}
                onChange={handleChange}
                name='categoryId'
              >
                <option value=""> Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

               <select
                
                className="select select-bordered w-full"
                value={formData.unit}
                onChange={handleChange}
                name='unit'
              >
                <option value=""> Sélectionner l&apos;unité</option>
                <option value="g">Gramme</option>
                <option value="Kg">Kilogramme</option>
                <option value="L"> Litre </option>
                <option value="M">Mètre</option>
                <option value="Cm">Centimètre</option>
                <option value="Pqts">Paquets</option>
                <option value="Pcs">Pièces</option>
                <option value="Btes">Boîtes</option>
                
              </select>

              <input
                type="file"
                name="image/*"
                placeholder="Prix"
                className="file-input file-input-bordered w-full"
                onChange={handleFileChange}
                />

                <button onClick={handleSubmit} className="btn btn-success">
                  Créer l&apos;article
                </button>

              </div>

              <div className="md:ml-4 md:w-[300PX] mt-4 md:mt-0 border-2 border-success md:h-[300PX] p-5 flex 
              justify-center items-center rounded-3xl">
              {previewUrl && previewUrl !== "" ? (
              <div>
                <ProductImage
                src={previewUrl}
                alt="preview"
                heightClass="h-40"
                widthClass="w-40"
                />
              </div>
              ): (
              <div className="wiggle-animation">
                  <FileImage strokeWidth={1} className="h-10 w-10 text-success"/>
              </div>
              )}
            </div>

          </section>

        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
