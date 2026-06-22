import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProblemById } from "../services/problemService.js";
import { createProblem, updateProblem } from "../services/adminService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { ArrowLeft } from "lucide-react";

const AdminProblemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    tags: "",
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    examples: [],
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchProblem = async () => {
        try {
          const response = await getProblemById(id);
          const p = response.data;
          setFormData({
            title: p.title || "",
            difficulty: p.difficulty || "Easy",
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
            statement: p.statement || "",
            inputFormat: p.inputFormat || "",
            outputFormat: p.outputFormat || "",
            constraints: p.constraints || "",
            examples: p.examples || [],
          });
        } catch (err) {
          setError(getErrorMessage(err) || "Failed to load problem details");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProblem();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Examples array handling
  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...formData.examples];
    updatedExamples[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      examples: updatedExamples,
    }));
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", explanation: "" }],
    }));
  };

  const removeExample = (index) => {
    const updatedExamples = formData.examples.filter((_, idx) => idx !== index);
    setFormData((prev) => ({
      ...prev,
      examples: updatedExamples,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    // Format tags from comma-separated string to array
    const formattedTags = formData.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      difficulty: formData.difficulty,
      tags: formattedTags,
      statement: formData.statement.trim(),
      inputFormat: formData.inputFormat.trim(),
      outputFormat: formData.outputFormat.trim(),
      constraints: formData.constraints.trim(),
      examples: formData.examples.map((ex) => ({
        input: ex.input.trim(),
        output: ex.output.trim(),
        explanation: ex.explanation.trim(),
      })),
    };

    try {
      if (isEditMode) {
        await updateProblem(id, payload);
        alert("Problem updated successfully");
      } else {
        await createProblem(payload);
        alert("Problem created successfully");
      }
      navigate("/admin");
    } catch (err) {
      setError(getErrorMessage(err) || "An error occurred while saving the problem");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="page-status">Loading problem details...</div>;
  }

  return (
    <section className="detail-page" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link className="back-link" to="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "1.5rem" }}>
        <ArrowLeft size={16} />
        Back to Admin Panel
      </Link>

      <header style={{ marginBottom: "2rem" }}>
        <p className="eyebrow">{isEditMode ? "Edit Challenge" : "New Challenge"}</p>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", margin: "0.25rem 0" }}>
          {isEditMode ? "Update Problem Details" : "Create Coding Problem"}
        </h1>
      </header>

      {error && <div className="alert error" style={{ marginBottom: "1.5rem" }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-card" style={{ maxWidth: "100%", width: "100%", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Problem Title *</span>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Two Sum"
              required
              disabled={isSaving}
              style={{ width: "100%" }}
            />
          </label>

          <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Difficulty *</span>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              disabled={isSaving}
              style={{ width: "100%", height: "46px" }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>
        </div>

        <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Tags (comma-separated)</span>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. array, hash-table, math"
            disabled={isSaving}
          />
        </label>

        <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Problem Statement *</span>
          <textarea
            name="statement"
            value={formData.statement}
            onChange={handleChange}
            placeholder="Describe the problem, input limits, logic, etc."
            required
            rows={6}
            disabled={isSaving}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        </label>

        <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Input Format</span>
          <textarea
            name="inputFormat"
            value={formData.inputFormat}
            onChange={handleChange}
            placeholder="Describe the format of standard input."
            rows={3}
            disabled={isSaving}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        </label>

        <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Output Format</span>
          <textarea
            name="outputFormat"
            value={formData.outputFormat}
            onChange={handleChange}
            placeholder="Describe the expected format of standard output."
            rows={3}
            disabled={isSaving}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        </label>

        <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Constraints</span>
          <textarea
            name="constraints"
            value={formData.constraints}
            onChange={handleChange}
            placeholder="e.g. 1 <= nums.length <= 10^4"
            rows={3}
            disabled={isSaving}
            style={{ width: "100%", fontFamily: "inherit" }}
          />
        </label>

        {/* Dynamic Examples Section */}
        <section style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Examples (shown to users)</h2>
            <button
              type="button"
              className="secondary-button"
              onClick={addExample}
              disabled={isSaving}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto" }}
            >
              + Add Example
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {formData.examples.map((example, index) => (
              <div key={index} className="example-card" style={{ border: "1px solid #e2e8f0", padding: "1.25rem", borderRadius: "12px", background: "#f8fafc", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>Example {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    disabled={isSaving}
                    style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem", height: "auto", border: "1px solid #ef4444", color: "#ef4444", background: "transparent", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Input *</span>
                    <input
                      type="text"
                      value={example.input}
                      onChange={(e) => handleExampleChange(index, "input", e.target.value)}
                      placeholder="e.g. nums = [2,7,11,15], target = 9"
                      required
                      disabled={isSaving}
                      style={{ width: "100%", background: "#ffffff" }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Output *</span>
                    <input
                      type="text"
                      value={example.output}
                      onChange={(e) => handleExampleChange(index, "output", e.target.value)}
                      placeholder="e.g. [0,1]"
                      required
                      disabled={isSaving}
                      style={{ width: "100%", background: "#ffffff" }}
                    />
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Explanation</span>
                    <textarea
                      value={example.explanation}
                      onChange={(e) => handleExampleChange(index, "explanation", e.target.value)}
                      placeholder="Explain how the output is reached."
                      rows={2}
                      disabled={isSaving}
                      style={{ width: "100%", background: "#ffffff", fontFamily: "inherit" }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="primary-button"
          disabled={isSaving}
          style={{ width: "100%", marginTop: "1rem", display: "block" }}
        >
          {isSaving ? "Saving..." : isEditMode ? "Update Problem" : "Create Problem"}
        </button>
      </form>
    </section>
  );
};

export default AdminProblemForm;
