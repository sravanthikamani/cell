import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";
import { Edit2, Trash2 } from "lucide-react";

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const { t } = useI18n();
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

  useEffect(() => {
    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProfile)
      .catch(console.error);
  }, [token]);

  if (!profile) return <div className="p-10">{t("Loading...")}</div>;

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
    <div className="max-w-3xl mx-auto p-10 card">
      <h1 className="text-2xl font-bold mb-6">{t("My Profile")}</h1>

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

      <h2 className="text-xl font-bold mt-8 mb-3">{t("Addresses")}</h2>
      {(profile.addresses || []).map((addr, i) => (
        <div key={i} className="border p-3 mb-3">
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
        <h3 className="font-semibold mb-2">{t("Add New Address")}</h3>
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
            className="text-sm text-gray-700"
            onClick={() => setNewAddress({ name: "", phone: "", street: "", city: "", pincode: "" })}
          >
            {t("Clear")}
          </button>
          <div className="text-sm text-gray-500 self-center">{t("Fill this form and click Save Profile to add")}</div>
        </div>
      </div>

      {msg && <div className="text-sm text-green-700">{msg}</div>}

      <button
        className="mt-3 bg-teal-600 text-white px-6 py-2"
        onClick={save}
      >
        {t("Save Profile")}
      </button>
    </div>
  );
}
