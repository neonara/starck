import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const InstallationDetailsModal = ({ isOpen, setIsOpen, installation }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/30 backdrop-blur-sm fixed inset-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95%] max-w-4xl p-6 rounded-2xl bg-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 space-y-6">

<div className="flex justify-between items-center mb-4">
  <Dialog.Title className="text-2xl font-bold text-gray-800">Détails de l'Installation</Dialog.Title>
  <Dialog.Close className="text-gray-400 hover:text-gray-600">
    <X size={24} />
  </Dialog.Close>
</div>


          {/* Photo Installation */}
          {installation.photo_installation_url && (
            <div className="w-full h-80 rounded-xl overflow-hidden mb-6">
              <img src={installation.photo_installation_url} alt="Installation" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Informations principales */}
          <div className="grid grid-cols-1 text-gray-500 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p><strong>🏷️ Nom :</strong> {installation.nom}</p>
              <p><strong>📍 Adresse :</strong> {[installation.adresse, installation.ville, installation.code_postal, installation.pays].filter(Boolean).join(", ")}</p>
              <p><strong>⚡ Capacité :</strong> {installation.capacite_kw ?? "—"} kW</p>
              <p><strong>🔧 Type :</strong> {installation.type_installation || "—"}</p>
              </div>

            <div className="space-y-2 text-gray-500">
            <p><strong>📅 Date Installation :</strong> {installation.date_installation ? new Date(installation.date_installation).toLocaleDateString() : "—"}</p>
            <p><strong>🛡️ Fin de garantie :</strong> {installation.expiration_garantie || "—"}</p>
              <p><strong>📄 Référence Contrat :</strong> {installation.reference_contrat || "—"}</p>
              <p><strong>⚙️ Statut :</strong> {installation.statut || "—"}</p>
              </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InstallationDetailsModal;
