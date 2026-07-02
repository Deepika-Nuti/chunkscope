import { FileMetadata } from "./api";

export const DEMO_DATASETS: Record<string, FileMetadata> = {
  "research_paper.pdf": {
    filename: "attention_research_paper.pdf",
    file_size: 4820,
    page_count: 5,
    word_count: 520,
    char_count: 3200,
    token_count: 820,
    text: `Attention Is All You Need (Abstract & Introduction)
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.

Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature.

Recurrent models usually factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states, as a function of the previous hidden state and the input. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has achieved significant improvements in computational efficiency through factorization tricks and conditional computation, while also improving model performance in the latter case. However, the fundamental constraint of sequential computation remains.

Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences. In all but a few cases, however, such attention mechanisms are used in conjunction with a recurrent network.

In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an self-attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.`
  },
  "legal_contract.pdf": {
    filename: "mutual_non_disclosure_agreement.pdf",
    file_size: 6150,
    page_count: 3,
    word_count: 480,
    char_count: 2950,
    token_count: 730,
    text: `MUTUAL NON-DISCLOSURE AGREEMENT
This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between the disclosing party ("Discloser") and the receiving party ("Recipient") to govern the sharing of proprietary, technical, and trade secret information.

1. Definition of Confidential Information.
"Confidential Information" refers to any information, technical data, or know-how disclosed by one party to the other, whether orally, in writing, or by inspection of tangible objects, including but not limited to source code, financial forecasts, customer databases, product blueprints, and marketing strategies. Confidential Information must be marked as "Confidential" or "Proprietary" at the time of disclosure, or if disclosed orally, designated as confidential in writing within thirty (30) days of disclosure.

2. Obligations of Non-Disclosure.
The Recipient agrees that at all times it will hold in strict confidence and trust all Confidential Information of the Discloser. The Recipient shall not disclose any Confidential Information to third parties without prior written consent, except to its officers, employees, and legal advisors who have a strict "need to know" and who are bound by confidentiality covenants no less restrictive than those contained herein.

3. Exclusions from Confidentiality.
The obligations of confidentiality shall not apply to any information that:
(a) is or becomes publicly available through no breach of this Agreement by the Recipient;
(b) was already in the rightful possession of the Recipient prior to disclosure;
(c) is independently developed by the Recipient without reference to or reliance upon the Discloser's Confidential Information;
(d) is rightfully acquired from a third party without restriction on disclosure.

4. Term and Termination.
This Agreement and the Recipient's duty of confidentiality shall remain in effect for a period of five (5) years from the effective date of this Agreement, or until such time as the Discloser releases the Recipient in writing. Upon written request, the Recipient shall immediately return or destroy all physical documents and electronic records containing the Discloser's Confidential Information.`
  },
  "medical_report.pdf": {
    filename: "cardiology_consult_report.pdf",
    file_size: 3890,
    page_count: 2,
    word_count: 390,
    char_count: 2450,
    token_count: 610,
    text: `CARDIOLOGY CONSULTATION REPORT
Patient Name: Johnathan Doe
Date of Birth: October 14, 1974
Admitting Physician: Dr. Sarah Jenkins, MD
Consulting Cardiologist: Dr. Alan Vance, MD, FACC

REASON FOR CONSULTATION:
Evaluations of atypical chest pain, progressive exertional dyspnea, and mild palpitations over the past six weeks.

HISTORY OF PRESENT ILLNESS:
The patient is a 51-year-old male with a history of essential hypertension and hyperlipidemia. He reports experiencing intermittent substernal chest discomfort described as a dull squeeze. The episodes typically occur during moderate physical activities, such as climbing stairs or brisk walking, and resolve with five to ten minutes of rest. He denies radiation of pain to the jaw, neck, or left upper extremity. No history of syncopal episodes, orthopnea, or paroxysmal nocturnal dyspnea.

LABORATORY FINDINGS:
- Troponin I: <0.01 ng/mL (Normal)
- BNP (Brain Natriuretic Peptide): 45 pg/mL (Normal < 100)
- Total Cholesterol: 242 mg/dL (Elevated)
- LDL Cholesterol: 165 mg/dL (Elevated)
- HDL Cholesterol: 38 mg/dL (Borderline Low)
- Serum Triglycerides: 195 mg/dL (Elevated)

DIAGNOSTIC TEST RESULTS:
1. Electrocardiogram (ECG): Shows normal sinus rhythm at 72 bpm. Mild left ventricular hypertrophy (LVH) by voltage criteria. No acute ST-segment elevations, depressions, or T-wave inversions.
2. Echocardiogram: Left ventricular ejection fraction (LVEF) is estimated at 55-60%, representing preserved systolic function. Concentric LV hypertrophy is noted. Normal valvular structures with trace mitral regurgitation.
3. Exercise Stress Test: Completed 8 minutes of the standard Bruce Protocol. The patient reported onset of mild chest tightness at heart rate 142 bpm (84% of max predicted). Segmental ST depressions of 1.2 mm were noted in leads V4-V6 during recovery, which resolved within 4 minutes of rest.

ASSESSMENT & PLAN:
1. Atypical Chest Pain: Likely stable angina pectoris secondary to atherosclerotic coronary artery disease, given positive stress test findings.
2. Optimize Medical Management: Initiate Aspirin 81 mg daily and Atorvastatin (Lipitor) 40 mg at bedtime. Titrate Metoprolol Succinate to 50 mg daily for target heart rate control.
3. Referral: Schedule elective outpatient cardiac catheterization to assess coronary anatomy and determine if percutaneous coronary intervention (PCI) is warranted.`
  },
  "wikipedia_article.md": {
    filename: "rag_wikipedia_summary.md",
    file_size: 4500,
    page_count: 4,
    word_count: 450,
    char_count: 2750,
    token_count: 680,
    text: `# Retrieval-Augmented Generation (RAG)
Retrieval-Augmented Generation (RAG) is a natural language processing architecture that optimizes the output of large language models. Originally introduced by Lewis et al. in 2020, RAG systems merge LLMs with external document index search tables.

## Pipeline Architecture
A standard RAG pipeline operates through three distinct stages:

### 1. Indexing (Offline Phase)
Before retrieval occurs, raw source documents must be processed and converted into a searchable format:
- **Parsing**: Document text is extracted from formats like PDF or HTML.
- **Chunking**: The document is split into smaller text segments (chunks) using size boundaries.
- **Embedding**: Each text chunk is passed to an embedding model (e.g. OpenAI text-embedding-3) to generate a high-dimensional vector.
- **Storing**: The vectors and text chunks are stored in a dedicated vector database (e.g., ChromaDB, FAISS, Pinecone).

### 2. Retrieval (Online Phase)
When a user submits a prompt, the system queries the database:
- The user's query is converted into a vector using the same embedding model.
- The vector database performs a semantic vector search (e.g. Cosine Similarity) to locate the Top-K closest chunk vectors.
- These selected text chunks are pulled from storage.

### 3. Generation (Response Phase)
The retrieved chunks are formatted into a prompt template alongside the user's original query:
\`\`\`
Use the following context to answer the question:
[Retrieved Chunk 1]
[Retrieved Chunk 2]

Question: How does RAG reduce hallucinations?
\`\`\`
The LLM reads this augmented prompt and synthesizes a grounded answer, referencing facts from the retrieved data. This process ensures the response is factual, verifiable, and free of typical generative hallucinations.`
  },
  "python_documentation.txt": {
    filename: "python_decorator_documentation.txt",
    file_size: 4210,
    page_count: 3,
    word_count: 410,
    char_count: 2550,
    token_count: 640,
    text: `Python Decorator Pattern & Advanced Closures
In Python, functions are first-class objects. This means that functions can be passed as arguments to other functions, returned from functions, and assigned to variables. A decorator is a design pattern that wraps a callable object, allowing developers to inject custom behavior before or after execution without modifying the original source code.

Basic Decorator Syntax:
Decorators are applied using the "@" syntax directly above a function definition:

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Executing before the function call.")
        result = func(*args, **kwargs)
        print("Executing after the function call.")
        return result
    return wrapper

@my_decorator
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

How Closures Work under the Hood:
A decorator relies on closures. A closure is a nested inner function that retains access to variables defined in its outer enclosing scope, even after the outer function has finished executing. In the example above, the nested 'wrapper' function forms a closure that captures the 'func' variable from the scope of 'my_decorator'.

Decorators with Arguments:
To pass parameters to the decorator itself, you must implement an additional level of wrapping, creating a function that returns a decorator:

\`\`\`python
def repeat(num_times):
    def decorator_repeat(func):
        def wrapper(*args, **kwargs):
            for _ in range(num_times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator_repeat

@repeat(num_times=3)
def ping():
    print("Ping!")
\`\`\`

Common Use Cases in AI & Web Development:
1. Logging & Execution Timing: Decorating model inference calls to log request times and inputs.
2. Authentication: Securing API routes by verifying auth headers before executing the endpoint logic.
3. Caching & Memoization: Storing expensive query outputs in-memory to prevent repeated calculations.`
  }
};
