import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { getTests } from "../api/tests";
import type { Test } from "../types/test";
import StatusBadge from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

export default function Dashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
   const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTests();

      // Ensure status has a default value if null/undefined
      const testsWithDefaultStatus = data.map((test: Test) => ({
        ...test,
        status: test.status || "draft",
        name: test.name || "",
        subject: test.subject || "",
      }));

      setTests(testsWithDefaultStatus);
    } catch (error) {
      console.error("GET TESTS ERROR:", error);
      setError("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        test.name?.toLowerCase().includes(search.toLowerCase()) ||
        test.subject?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        test.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tests, search, statusFilter]);

  const totalTests = tests.length;

  const draftTests = tests.filter(
    (test) => test.status?.toLowerCase() === "draft"
  ).length;

  const scheduledTests = tests.filter(
    (test) => test.status?.toLowerCase() === "scheduled"
  ).length;

  const liveTests = tests.filter(
    (test) => test.status?.toLowerCase() === "live"
  ).length;

  const handleCreateTest = () => {
    console.log("Create test");
  };

  const handleView = (id: string) => {
    console.log("View test:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit test:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete test:", id);
  };

  if (loading) {
    return (
      <main className="dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            Loading tests...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <div className="dashboard-container">
          <div className="error-state">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <div className="dashboard-container">

        {/* Header */}

        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Test Management
            </h1>

            <p className="dashboard-subtitle">
              Create, manage and publish your tests
            </p>
          </div>

          <button
            className="create-test-button"
            onClick={() => navigate("/tests/create")}
          >
            <Plus size={18} />
            Create New Test
          </button>
        </header>

        {/* Statistics */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-label">
              Total Tests
            </div>

            <div className="stat-value">
              {totalTests}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Draft
            </div>

            <div className="stat-value">
              {draftTests}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Scheduled
            </div>

            <div className="stat-value">
              {scheduledTests}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Live
            </div>

            <div className="stat-value">
              {liveTests}
            </div>
          </div>

        </section>

        {/* Tests */}

        <section className="tests-section">

          <div className="tests-toolbar">

            <div className="search-wrapper">

              <Search
                size={17}
                className="search-icon"
              />

              <input
                type="text"
                placeholder="Search tests..."
                className="search-input"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="live">
                Live
              </option>
            </select>

          </div>

          {filteredTests.length === 0 ? (
            <div className="empty-state">
              No tests found.
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="tests-table">

                <thead>
                  <tr>
                    <th>TEST</th>
                    <th>QUESTIONS</th>
                    <th>MARKS</th>
                    <th>DURATION</th>
                    <th>DIFFICULTY</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTests.map((test) => (

                    <tr key={test.id}>

                      <td>
                        <div className="test-name">
                          {test.name || "Untitled Test"}
                        </div>

                        <div className="test-subject">
                          {test.subject || "No Subject"}
                        </div>
                      </td>

                      <td>
                        {test.total_questions || 0}
                      </td>

                      <td>
                        {test.total_marks || 0}
                      </td>

                      <td>
                        {test.total_time || 0} min
                      </td>

                      <td>
                        {test.difficulty || "N/A"}
                      </td>

                      <td>
                        <StatusBadge
                          status={test.status || "draft"}
                        />
                      </td>

                      <td>
                        {test.created_at
                          ? new Date(test.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="action-button"
                            title="View"
                            onClick={() =>
                              handleView(test.id)
                            }
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            className="action-button"
                            title="Edit"
                            onClick={() =>
                              handleEdit(test.id)
                            }
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="action-button delete-button"
                            title="Delete"
                            onClick={() =>
                              handleDelete(test.id)
                            }
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}