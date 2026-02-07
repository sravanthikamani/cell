import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../lib/api";
import { useI18n } from "../context/I18nContext";

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");
  const { t } = useI18n();

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

  const updateAddress = (index, key, value) => {
    const next = [...(profile.addresses || [])];
    next[index] = { ...next[index], [key]: value };
    updateField("addresses", next);
  };

  const save = async () => {
    setMsg("");
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: profile.name,
        phone: profile.phone,
        addresses: profile.addresses || [],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || t("Failed to save profile"));
      return;
    }
    setProfile(data);
    setMsg(t("Profile saved"));
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
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2"
              placeholder={t("Name")}
              value={addr.name || ""}
              onChange={(e) => updateAddress(i, "name", e.target.value)}
            />
            <input
              className="border p-2"
              placeholder={t("Phone")}
              value={addr.phone || ""}
              onChange={(e) => updateAddress(i, "phone", e.target.value)}
            />
            <input
              className="border p-2 col-span-2"
              placeholder={t("Street")}
              value={addr.street || ""}
              onChange={(e) => updateAddress(i, "street", e.target.value)}
            />
            <input
              className="border p-2"
              placeholder={t("City")}
              value={addr.city || ""}
              onChange={(e) => updateAddress(i, "city", e.target.value)}
            />
            <input
              className="border p-2"
              placeholder={t("Pincode")}
              value={addr.pincode || ""}
              onChange={(e) => updateAddress(i, "pincode", e.target.value)}
            />
          </div>
          <button
            className="mt-2 text-sm text-red-600"
            onClick={() => {
              const next = [...(profile.addresses || [])];
              next.splice(i, 1);
              updateField("addresses", next);
            }}
          >
            {t("Remove")}
          </button>
        </div>
      ))}

      <button
        className="mb-6 text-sm text-blue-600"
        onClick={() =>
          updateField("addresses", [
            ...(profile.addresses || []),
            { name: "", phone: "", street: "", city: "", pincode: "" },
          ])
        }
      >
        {t("+ Add Address")}
      </button>

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
