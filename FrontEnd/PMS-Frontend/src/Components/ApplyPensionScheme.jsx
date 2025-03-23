import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ApplyPensionScheme = () => {
    const [schemes, setSchemes] = useState([]);
    const [investmentAmount, setInvestmentAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSchemes = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/PMS/employee/pension-schemes", {
                    headers: {
                        token: token,   
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch pension schemes");
                }

                const data = await response.json();
                setSchemes(data);
            } catch (err) {
                console.error("Error fetching pension schemes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, [navigate]);

    const handleApplyScheme = async (schemeId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/PMS/employee/apply-pension-scheme", {
                method: "POST",
                headers: {
                    token: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    schemeId,
                    investmentAmount,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to apply for pension scheme");
            }

            alert("Pension scheme applied successfully!");
        } catch (err) {
            console.error("Error applying for pension scheme:", err);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1>Apply for Pension Schemes</h1>
            <div>
                <h2>Available Pension Schemes</h2>
                <ul>
                    {schemes.map((scheme) => (
                        <li key={scheme._id}>
                            <h3>{scheme.name}</h3>
                            <p>{scheme.description}</p>
                            <p>Minimum Investment: ₹{scheme.minimumInvestment}</p>
                            <p>Maximum Investment: ₹{scheme.maximumInvestment}</p>
                            <p>Interest Rate:{scheme.interestRate}%</p>
                            <p>Duration: {scheme.duration} years</p>
                            <input
                                type="number"
                                placeholder="Investment Amount"
                                onChange={(e) => setInvestmentAmount(e.target.value)}
                            />
                            <button onClick={() => handleApplyScheme(scheme._id)}>Apply</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ApplyPensionScheme;