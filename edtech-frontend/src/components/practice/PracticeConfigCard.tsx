import { useEffect, useState } from 'react';
import { getKnowledgeGraph, type KnowledgePoint, type GenerateQuestionParams } from '../../api/services/knowledge';

interface PracticeConfigCardProps {
    onGenerate: (params: GenerateQuestionParams) => void;
    isLoading?: boolean;
}

export function PracticeConfigCard({ onGenerate, isLoading = false }: PracticeConfigCardProps) {
    const [knowledgeMap, setKnowledgeMap] = useState<Record<string, KnowledgePoint[]>>({});
    const [subjects, setSubjects] = useState<string[]>([]);
    
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedKpId, setSelectedKpId] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('Medium');
    const [loadingGraph, setLoadingGraph] = useState(true);

    useEffect(() => {
        getKnowledgeGraph().then(data => {
            setKnowledgeMap(data);
            setSubjects(Object.keys(data));
            if (Object.keys(data).length > 0) {
                setSelectedSubject(Object.keys(data)[0]);
            }
            setLoadingGraph(false);
        });
    }, []);

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sub = e.target.value;
        setSelectedSubject(sub);
        setSelectedKpId(''); // Reset KP when subject changes
    };

    const handleGenerate = () => {
        onGenerate({
            subject: selectedSubject,
            knowledgePointId: selectedKpId ? Number(selectedKpId) : undefined,
            difficulty
        });
    };

    const currentKps = selectedSubject ? (knowledgeMap[selectedSubject] || []) : [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚙️</span> 
                Practice Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Subject Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Subject</label>
                    <select 
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                        disabled={loadingGraph}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>

                {/* Knowledge Point Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Knowledge Point (Optional)</label>
                    <select 
                        value={selectedKpId}
                        onChange={(e) => setSelectedKpId(e.target.value)}
                        disabled={!selectedSubject}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Random / All</option>
                        {currentKps.map(kp => (
                            <option key={kp.id} value={kp.id}>{kp.name}</option>
                        ))}
                    </select>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Difficulty</label>
                    <select 
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !selectedSubject}
                    className={`
                        px-6 py-2.5 rounded-lg font-medium text-white transition-all
                        ${isLoading || !selectedSubject 
                            ? 'bg-slate-300 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95'}
                    `}
                >
                    {isLoading ? 'Generating...' : 'Start Targeted Practice'}
                </button>
            </div>
        </div>
    );
}
