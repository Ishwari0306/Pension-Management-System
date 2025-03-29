import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PensionApply.css"

const ApplicationHistory = () => {
    const [appliedSchemes, setAppliedSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppliedSchemes = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/PMS/employee/applied-schemes", {
                    headers: {
                        token: token,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch applied schemes");
                }

                const data = await response.json();
                setAppliedSchemes(data);
            } catch (err) {
                console.error("Error fetching applied schemes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppliedSchemes();
    }, [navigate]);

    if (loading) {
        return <div className="loading-text">Loading...</div>;
    }

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'approved':
                return 'status-approved';
            case 'rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    return (
        <div className="pension-container">
            <h1 className="pension-title">Application History</h1>
            <div>
                <h2 className="pension-subtitle">Applied Schemes</h2>
                <ul className="application-list">
                    {appliedSchemes.map((scheme) => (
                        <li key={scheme._id} className="application-card">
                            <h3 className="scheme-name">{scheme.schemeId.name}</h3>
                            <p className="scheme-detail">
                                <strong>Investment Amount:</strong> ₹{scheme.investmentAmount}
                            </p>
                            <p className="scheme-detail">
                                <strong>Status:</strong> 
                                <span className={getStatusClass(scheme.status)}> {scheme.status}</span>
                            </p>
                            <p className="scheme-detail">
                                <strong>Applied At:</strong> {new Date(scheme.appliedAt).toLocaleString()}
                            </p>
                            {scheme.adminNote && (
                                <div className="admin-note">
                                    <strong>Admin Note:</strong> {scheme.adminNote}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ApplicationHistory;