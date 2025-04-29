import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import toast from "react-hot-toast";
import ApiService from "../Api/Api";
const statusColors = {
  planifie: "border-l-4 border-blue-500 bg-blue-50",
  en_cours: "border-l-4 border-yellow-500 bg-yellow-50",
  termine: "border-l-4 border-green-500 bg-green-50",
  annule: "border-l-4 border-red-500 bg-red-50",
};

const CalendrierEntretiensInstallateur = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();

      try {
        const res = await ApiService.getCalendarEntretiensInstallateur({ start_date: start, end_date: end });
        const formatted = res.data.map((e) => ({
          id: e.id,
          title: `${e.title} [${e.priority}]`,
          start: e.start,
          end: e.end,
          extendedProps: {
            statut: e.status,
            priorite: e.priority,
            technicien: e.technicien,
            installation_id: e.installation_id,
          }
        }));
        setEvents(formatted);
      } catch (err) {
        console.error("Erreur chargement calendrier :", err);
        toast.error("❌ Erreur chargement calendrier");
      }
    };

    fetchEvents();
  }, []);

  const renderEventContent = (eventInfo) => {
    const { statut, technicien } = eventInfo.event.extendedProps;
    const colorClass = statusColors[statut] || "bg-gray-50 border-l-4 border-gray-400";

    return (
      <div className={`rounded px-2 py-1 text-sm shadow-sm ${colorClass}`}>
        <strong className="block text-gray-800 truncate">{eventInfo.event.title}</strong>
        {technicien && <span className="block text-gray-500 text-xs">👷 {technicien}</span>}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="rounded-lg bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Calendrier de mes entretiens</h2>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          locale={frLocale}
          events={events}
          height="auto"
          eventContent={renderEventContent}
          eventClick={(info) => {
            const entretienId = info.event.id;
            window.location.href = `/details-entretien/${entretienId}`;
          }}
          dayMaxEventRows={4}
          eventDisplay="block"
        />
      </div>
    </div>
  );
};

export default CalendrierEntretiensInstallateur;
