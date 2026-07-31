import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { serviceService } from "../services/api";

interface Service {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchServices = async () => {
    try {
      const response = await serviceService.getServices();
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    setLoading(true);
    try {
      await serviceService.addService(newServiceName.trim());
      setNewServiceName("");
      fetchServices();
      toast.success("Service added successfully!");
    } catch (error: any) {
      console.error("Failed to add service:", error);
      toast.error(error.response?.data?.message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = async (service: Service) => {
    setEditingId(service.id);
    setEditingName(service.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    setLoading(true);
    try {
      await serviceService.updateService(editingId!, editingName.trim());
      setEditingId(null);
      setEditingName("");
      fetchServices();
      toast.success("Service updated successfully!");
    } catch (error: any) {
      console.error("Failed to update service:", error);
      toast.error(error.response?.data?.message || "Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteService = async (service: Service) => {
    if (
      window.confirm(
        `Are you sure you want to delete the service "${service.name}"?`,
      )
    ) {
      try {
        await serviceService.deleteService(service.id);
        fetchServices();
        toast.success("Service deleted successfully!");
      } catch (error: any) {
        console.error("Failed to delete service:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete service",
        );
      }
    }
  };

  return (
    <div className="services-page">
      <h2>Services Management</h2>
      <div className="services-content">
        <div className="add-service-form">
          <h3>Add New Service</h3>
          <form onSubmit={handleAddService}>
            <div className="form-group">
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Enter service name"
                disabled={loading}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Service"}
            </button>
          </form>
        </div>

        <div className="services-list">
          <h3>Available Services ({services.length})</h3>
          {fetching ? (
            <div className="loading">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="no-services">No services available</div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-item">
                  {editingId === service.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button
                          className="btn btn-primary btn-small"
                          onClick={handleSaveEdit}
                          disabled={loading}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-small"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="service-name">{service.name}</span>
                      <div className="service-actions">
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => handleEditService(service)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteService(service)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Services;
