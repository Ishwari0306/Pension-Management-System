import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1>Application History</h1>
            <div>
                <h2>Applied Schemes</h2>
                <ul>
                    {appliedSchemes.map((scheme) => (
                        <li key={scheme._id}>
                            <h3>{scheme.schemeId.name}</h3>
                            <p>Investment Amount: ${scheme.investmentAmount}</p>
                            <p>Status: {scheme.status}</p>
                            <p>Applied At: {new Date(scheme.appliedAt).toLocaleString()}</p>
                            {scheme.adminNote && <p>Admin Note: {scheme.adminNote}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ApplicationHistory;