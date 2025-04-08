import { useState, useEffect } from "react";
import ApiService from "../../Api/Api"; 
import { UpdateProfileType } from "../../types/type";
import { IoClose } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";

const UpdateProfile = () => {
  const [formData, setFormData] = useState(UpdateProfileType);
  const [userRole, setUserRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    ApiService.getProfile()
      .then((response) => {
        setFormData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          email: response.data.email || "",
          old_password: "",
          new_password: "",
          confirm_new_password: "",
        });
        setUserRole(response.data.role || "");
      })
      .catch(() => {
        toast.error("Erreur lors de la récupération du profil.");
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.old_password) delete payload.old_password;
    if (!payload.new_password) delete payload.new_password;
    if (!payload.confirm_new_password) delete payload.confirm_new_password;

    try {
      await ApiService.updateProfile(payload);
      toast.success("Profil mis à jour avec succès ✅");
      setIsEditing(false);
    } catch (err) {
      const serverError = err.response?.data;
      if (typeof serverError === "object") {
        const firstKey = Object.keys(serverError)[0];
        toast.error(serverError[firstKey]);
      } else {
        toast.error("Erreur lors de la mise à jour.");
      }
    }
  };

  return (
    <div className="pt-28 px-6 w-full">
      <Toaster />

      <div className="w-full max-w-5xl mx-20">
        <div className="bg-white rounded-xl shadow p-6 relative">
          <h2 className="text-xl font-semibold mb-4">Profil</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Prénom</p>
              <p className="font-medium">{formData.first_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Nom</p>
              <p className="font-medium">{formData.last_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{formData.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 px-4 py-2 flex items-center gap-2 rounded-full border text-sm hover:bg-gray-100"
          >
            ✏️ Modifier
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              <IoClose />
            </button>

            <h2 className="text-2xl font-semibold mb-1">Modifier le profil</h2>
            <p className="text-gray-500 mb-6">Mettez à jour vos informations personnelles</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {userRole === "admin" && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Ancien mot de passe</label>
                <input
                  type="password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  name="confirm_new_password"
                  value={formData.confirm_new_password}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;