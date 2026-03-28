import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { Edit2, Trash2 } from "lucide-react";

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const { t } = useI18n();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    pincode: "",
  });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedAddress, setEditedAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    pincode: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProfile)
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    document.body.classList.add("profile-bg-active");
    return () => {
      document.body.classList.remove("profile-bg-active");
    };
  }, []);

  if (!profile) return <div className="p-10">{t("Loading...")}</div>;

  const resolveProfileImage = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url}`;
  };

  const profileInitial = String(profile?.name || profile?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const syncAuthUserLocal = (patch) => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      localStorage.setItem("user", JSON.stringify({ ...parsed, ...patch }));
      window.dispatchEvent(new Event("auth:changed"));
    } catch {
      // ignore local storage sync errors
    }
  };

  const updateField = (key, value) =>
    setProfile((p) => ({ ...p, [key]: value }));

  // helper that sends updated profile data to the server and updates state
  const persistProfile = async (updated) => {
    setMsg("");
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || t("Failed to save profile"));
      return false;
    }
    setProfile(data);
    syncAuthUserLocal({ name: data.name, phone: data.phone, profileImage: data.profileImage });
    setMsg(t("Profile saved"));
    return true;
  };

  const save = async () => {
    // original save used when user clicks the global button
    const addressesToSave = [...(profile.addresses || [])];
    const hasNew = Object.values(newAddress).some((v) => String(v || "").trim() !== "");
    if (hasNew) addressesToSave.unshift({ ...newAddress });
    const success = await persistProfile({
      name: profile.name,
      phone: profile.phone,
      addresses: addressesToSave,
    });
    if (success && hasNew) {
      setNewAddress({ name: "", phone: "", street: "", city: "", pincode: "" });
    }
  };

  return (
    <div className="profile-page-bg">
      <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">{t("My Profile")}</h1>

      <div className="mb-6 flex items-center gap-4">
        {profile.profileImage ? (
          <img
            src={resolveProfileImage(profile.profileImage)}
            alt="profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-slate-200 text-slate-700 border flex items-center justify-center text-2xl font-semibold">
            {profileInitial}
          </div>
        )}

        <div>
          <button
            type="button"
            className="border border-black bg-white px-3 py-1 text-sm"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("Upload Image")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={isUploadingImage}
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setMsg("");
              setIsUploadingImage(true);
              try {
                const fd = new FormData();
                fd.append("image", file);
                const res = await fetch(`${API_BASE}/api/users/me/upload-image`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  body: fd,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  throw new Error(data.error || "Failed to upload image");
                }
                setProfile(data);
                syncAuthUserLocal({ profileImage: data.profileImage, name: data.name, phone: data.phone });
                setMsg("Profile image updated");
              } catch (err) {
                setMsg(err.message || "Failed to upload image");
              } finally {
                setIsUploadingImage(false);
              }
            }}
          />
          {isUploadingImage && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          className="border p-2"
          placeholder={t("Name")}
          value={profile.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
        />
        <input
          className="border p-2"
          placeholder={t("Phone")}
          value={profile.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </div>

      <h2 className="text-xl font-bold mt-8 mb-3 text-black">{t("Addresses")}</h2>
      {(profile.addresses || []).map((addr, i) => (
        <div key={i} className="border bg-white p-3 mb-3">
          {editingIndex === i ? (
            <div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="border p-2"
                  placeholder={t("Name")}
                  value={editedAddress.name}
                  onChange={(e) => setEditedAddress((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                  className="border p-2"
                  placeholder={t("Phone")}
                  value={editedAddress.phone}
                  onChange={(e) => setEditedAddress((s) => ({ ...s, phone: e.target.value }))}
                />
                <input
                  className="border p-2 col-span-2"
                  placeholder={t("Street")}
                  value={editedAddress.street}
                  onChange={(e) => setEditedAddress((s) => ({ ...s, street: e.target.value }))}
                />
                <input
                  className="border p-2"
                  placeholder={t("City")}
                  value={editedAddress.city}
                  onChange={(e) => setEditedAddress((s) => ({ ...s, city: e.target.value }))}
                />
                <input
                  className="border p-2"
                  placeholder={t("Pincode")}
                  value={editedAddress.pincode}
                  onChange={(e) => setEditedAddress((s) => ({ ...s, pincode: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  className="text-sm text-teal-700"
                  onClick={async () => {
                    const next = [...(profile.addresses || [])];
                    next[i] = { ...editedAddress };
                    updateField("addresses", next);
                    setEditingIndex(-1);
                    setEditedAddress({ name: "", phone: "", street: "", city: "", pincode: "" });
                    await persistProfile({
                      name: profile.name,
                      phone: profile.phone,
                      addresses: next,
                    });
                  }}
                >
                  {t("Save")}
                </button>
                <button
                  className="text-sm text-gray-700"
                  onClick={() => {
                    setEditingIndex(-1);
                    setEditedAddress({ name: "", phone: "", street: "", city: "", pincode: "" });
                  }}
                >
                  {t("Cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div className="text-sm">
                {`${addr.name || ""}, ${addr.phone || ""}, ${addr.street || ""}, ${addr.city || ""} - ${addr.pincode || ""}`}
              </div>
              <div className="flex gap-3">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={t("Edit")}
                  title={t("Edit")}
                  onClick={() => {
                    setEditingIndex(i);
                    setEditedAddress({ ...addr });
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  aria-label={t("Remove")}
                  title={t("Remove")}
                  onClick={async () => {
                    const next = [...(profile.addresses || [])];
                    next.splice(i, 1);
                    updateField("addresses", next);
                    await persistProfile({
                      name: profile.name,
                      phone: profile.phone,
                      addresses: next,
                    });
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New address form */}
      <div className="border rounded p-4 mb-4">
        <h3 className="font-semibold mb-2 text-black">{t("Add New Address")}</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border p-2"
            placeholder={t("Name")}
            value={newAddress.name}
            onChange={(e) => setNewAddress((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="border p-2"
            placeholder={t("Phone")}
            value={newAddress.phone}
            onChange={(e) => setNewAddress((s) => ({ ...s, phone: e.target.value }))}
          />
          <input
            className="border p-2 col-span-2"
            placeholder={t("Street")}
            value={newAddress.street}
            onChange={(e) => setNewAddress((s) => ({ ...s, street: e.target.value }))}
          />
          <input
            className="border p-2"
            placeholder={t("City")}
            value={newAddress.city}
            onChange={(e) => setNewAddress((s) => ({ ...s, city: e.target.value }))}
          />
          <input
            className="border p-2"
            placeholder={t("Pincode")}
            value={newAddress.pincode}
            onChange={(e) => setNewAddress((s) => ({ ...s, pincode: e.target.value }))}
          />
        </div>
        <div className="flex gap-3 mt-3">
          <button
            className="text-sm text-white"
            onClick={() => setNewAddress({ name: "", phone: "", street: "", city: "", pincode: "" })}
          >
            {t("Clear")}
          </button>
          <div className="text-sm text-white self-center">{t("Fill this form and click Save Profile to add")}</div>
        </div>
      </div>

      {msg && <div className="text-sm text-green-700">{msg}</div>}

      <button
        className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-full"
        onClick={save}
      >
        {t("Save")}
      </button>
      </div>
    </div>
  );
}
