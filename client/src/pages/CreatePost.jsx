import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { preview } from "../assets";
import { getRandomPrompt } from "../utils";
import { FormField, Loader } from "../components";

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    prompt: "an armchair in the shape of an avocado", 
    photo: "",
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (form.prompt) {
      try {
        setGeneratingImg(true);

        const response = await fetch("http://localhost:8080/api/v1/artify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: form.prompt }),
        });

        const data = await response.json();

        if (response.ok) {
          setForm({ ...form, photo: `data:image/png;base64,${data.photo}` });
        } else {
          alert(data.message || "Image generation failed. Please try again.");
          console.error("Backend error:", data);
        }
      } catch (error) {
        alert("Error: " + error.message);
        console.error("Client error:", error);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert("Please enter a prompt");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.prompt && form.photo) {
      setLoading(true);

      try {
        const response = await fetch("http://localhost:8080/api/v1/post", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        await response.json();
        navigate("/");
      } catch (err) {
        alert(err);
      } finally {
        setLoading(false);
      }
    } else {
      alert("please enter a prompt and generate an image");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#ffffff] text-[32px]">Create</h1>
        <p className="mt-2 text-[#ffffff] text-[16px] max-w[500px]">
          Create imaginative and visually stunning images through AI and share
          them with the community
        </p>
      </div>

      <form className="mt-16 " onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <FormField
            labelName="Your name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            handleChange={handleChange}
          />
          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="Space Shuttle flying above Cape Town, digital art"
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe={true}
            handleSurpriseMe={handleSurpriseMe}
          />

          <div className="relative  border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-400 focus:border-y-amber-400 w-120 max-w-full p-3 h-auto  flex justify-center items-center mx-auto ">
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.prompt}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = preview;
                }}
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-9/12 h-9/12 object-contain opacity-40"
              />
            )}

            {generatingImg && (
              <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                <Loader />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            className="text-dark bg-[#ffffff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center cursor-pointer hover:scale-105 transition duration-500"
          >
            {generatingImg ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="mt-10">
          <p className="mt-2 text-[#ffffff] text-[14px]">
            Once you have created the image you want, you can share it with
            others in the community
          </p>
          <button
            type="submit"
            className="mt-3 text-dark bg-[#ffffff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center hover:scale-105 transition duration-500 cursor-pointer"
          >
            {loading ? "Sharing..." : "Share with the community"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;
