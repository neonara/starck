import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import toast from "react-hot-toast";
//import "@fullcalendar/daygrid/main.css";
//import "@fullcalendar/timegrid/main.css";

const statusColors = {
  planifie: "#3b82f6",     // Bleu
  en_cours: "#facc15",     // Jaune
  termine: "#22c55e",      // Vert
  annule: "#ef4444"        // Rouge
};

const CalendrierEntretiens = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const now = new Date();

      try {
        const res = await ApiService.getEntretienCalendar();
        const formatted = res.data.map((e) => ({
          id: e.id,
          title: `${e.title}`,
          start: e.start,
          end: e.end,
          backgroundColor: statusColors[e.status] || "#60a5fa",
          borderColor: "transparent",
          textColor: "#fff",
          classNames: ["fc-google-event"],
          extendedProps: {
            statut: e.status,
            technicien: e.technicien,
            installation_id: e.installation_id,
          },
        }));
        setEvents(formatted);
      } catch (err) {
        console.error("Erreur chargement calendrier :", err);
        toast.error("❌ Erreur chargement calendrier");
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="max-w-[95%] mx-auto pt-6">
      <div className="rounded-lg bg-white shadow border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            📆 Calendrier des entretiens
          </h2>
        </div>



        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale={frLocale}
          events={events}
          height="auto"
          dayMaxEventRows={3}
          eventDisplay="block"
          eventClick={(info) => {
            const entretienId = info.event.id;
            window.location.href = `/details-entretien/${entretienId}`;
          }}
          eventMouseEnter={(info) => {
            const tooltip = document.createElement("div");
            tooltip.innerHTML = `
            <div style="font-weight: 600;color: #444; margin-bottom: 4px;">${info.event.title}</div>
            <div style="font-size: 0.85rem; color: #444;">Technicien : ${info.event.extendedProps.technicien || "Non assigné"}</div>`;
            tooltip.style.position = "absolute";
            tooltip.style.zIndex = "1000";
            tooltip.style.background = "#fff";
            tooltip.style.border = "1px solid #ccc";
            tooltip.style.padding = "6px 10px";
            tooltip.style.borderRadius = "6px";
            tooltip.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
            tooltip.style.pointerEvents = "none";
            tooltip.id = "event-tooltip";
            document.body.appendChild(tooltip);
            info.el.addEventListener("mousemove", (e) => {
              tooltip.style.top = e.pageY + 15 + "px";
              tooltip.style.left = e.pageX + 15 + "px";
            });
          }}
          eventMouseLeave={() => {
            const tooltip = document.getElementById("event-tooltip");
            if (tooltip) tooltip.remove();
          }}
        />
      </div>

      {/* Styles custom Google-like */}
      <style>{`
        .fc .fc-button {
          background-color: #1a73e8;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-weight: 500;
        }
        .fc .fc-button:hover {
          background-color: #1765c1;
        }
        .fc .fc-button-primary:disabled {
          background-color: #cbd5e1;
        }
        .fc .fc-event.fc-google-event {
          border-radius: 4px;
          font-size: 0.9rem;
          padding: 2px 4px;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        .fc .fc-daygrid-event-dot {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CalendrierEntretiens;
