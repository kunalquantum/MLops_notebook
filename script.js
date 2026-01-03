const componentData = {
    data: {
        title: "Data Sources",
        status: "Streaming",
        description: "The primary origin of all signals. Includes transactional databases, unstructured data lakes, and real-time event streams like Kafka.",
        specs: ["Rate: 1.2GB/s", "Type: Hybrid S3/Kafka", "Security: TLS 1.3"],
        code: "def load_data():\n    stream = kafka.consumer('prod_data')\n    return stream.poll(1.0)",
        practices: "Implement automated data quality gates (Great Expectations) at the ingestion point to catch faulty schemas early."
    },
    engineering: {
        title: "Feature Engineering",
        status: "Computing",
        description: "Orchestrated transformations using Spark or Flink. Converts raw data into normalized feature vectors for both training and serving.",
        specs: ["Framework: PySpark", "Parallelism: 256x", "Type: Windowed Agg"],
        code: "def transform(df):\n    return df.withColumn('is_hot',\n        df.temp > threshold)",
        practices: "Ensure feature parity by using the same logic for batch training (Parquet) and real-time serving (Protobuf)."
    },
    repo: {
        title: "Code Repository",
        status: "Live",
        description: "Centralized version control for ML code, pipeline YAMLs, and Environment configs. The starting trigger for any CI/CD cycle.",
        specs: ["Provider: GitHub Ent", "Auth: SSO/SAML", "Hooks: Enabled"],
        code: "git commit -m 'Release v2.4'\ngit push origin production",
        practices: "Maintain a strict mono-repo or submodule policy to keep model research connected to feature logic versions."
    },
    cicd: {
        title: "CI/CD Pipeline",
        status: "Active",
        description: "Continuous Integration automates builds and testing. Continuous Delivery ensures models meet safety and performance benchmarks.",
        specs: ["Engine: GitHub Actions", "Build Time: 4.2m", "Success: 98.4%"],
        code: "- name: Model Test\n  run: pytest --accuracy=0.92",
        practices: "Automate model validation tests including canary tests and performance benchmarking against the current champion model."
    },
    "feature-store": {
        title: "Feature Store",
        status: "Serving",
        description: "A centralized hub to discover and serve features. Solves the training-serving skew by providing consistent feature values.",
        specs: ["Online: Redis (Low Latency)", "Offline: S3 (History)", "Skew: < 0.1%"],
        code: "features = fs.get_online_features(\n    keys={'id': 42}, \n    view='user_v1'\n)",
        practices: "Use a feature registry to enable team collaboration and feature reuse across different model families."
    },
    training: {
        title: "Training Infra",
        status: "Provisioned",
        description: "Auto-scaling GPU clusters orchestrated by Kubernetes. Handles distributed training, hyperparameter tuning, and cross-validation.",
        specs: ["Cluster: K8s/Ray", "Hardware: NVIDIA A100", "Autoscale: 2-50 nodes"],
        code: "trainer = DistributedTrainer()\ntrainer.train(data, config)",
        practices: "Implement checkpointing and fault-tolerant training to resume long-running jobs after spot-instance interruptions."
    },
    "reg-up": {
        title: "Deployment Registry",
        status: "Verifying",
        description: "A secure repository for models that have passed CI/CD. Ready for production rollout via Canary or Shadow deployments.",
        specs: ["Backend: MLflow", "Signature: Verified", "Stage: Staging"],
        code: "registry.transition('v2',\n    stage='Staging')",
        practices: "Sign your model artifacts cryptographically to ensure that only approved models are loaded by serving nodes."
    },
    "reg-low": {
        title: "Training Registry",
        status: "Syncing",
        description: "Captures experimental metrics directly from the Training Infrastructure. Records every run's hyperparameters and artifact lineage.",
        specs: ["Lineage: Full Track", "Metrics: Accuracy/Loss", "Capture: Auto"],
        code: "log_metric('auc', 0.941)\nlog_artifact('model.onnx')",
        practices: "Always relate a model version to the specific commit hash and data DVC hash that produced it."
    },
    metadata: {
        title: "Metadata Store",
        status: "Indexing",
        description: "An immutable database tracking the lineage of every artifact. Critical for regulatory compliance and root-cause analysis.",
        specs: ["Storage: Postgres", "Tracking: Kubeflow MLMD", "Lineage: 100%"],
        code: "store.get_lineage(artifact_id)",
        practices: "Metadata should be treated as high-availability data; it is the map for debugging production model degradations."
    },
    serving: {
        title: "Model Serving",
        status: "Traffic Up",
        description: "High-performance inference engine. Serves models as APIs with built-in auto-scaling, request logging, and basic monitoring hooks.",
        specs: ["Latancy: P99 < 50ms", "Throughput: 2k/s", "Scaling: 5-20 Pods"],
        code: "@app.post('/predict')\nasync def infer(input: Data):\n    return model.predict(input)",
        practices: "Use shadow deployments to compare new model performance against production traffic without impacting user experience."
    },
    monitoring: {
        title: "Model Monitoring",
        status: "Scanning",
        description: "Monitors real-time inference telemetry. Detects data drift, concept drift, and system health issues to trigger retraining.",
        specs: ["Check: Drift/Skew", "Alert: Slack/PagerDuty", "Logic: Kolmogorov-Smirnov"],
        code: "if detector.check_drift(x):\n    retrain_trigger.fire()",
        practices: "Monitor business metrics (e.g. CTR, UX conversion) alongside ML metrics (RMSE, Accuracy) for a holistic view."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const nodes = document.querySelectorAll('.active-node');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const startSimBtn = document.getElementById('start-simulation');
    const logContainer = document.getElementById('log-container');

    // UI Selectors
    const panelTitle = document.getElementById('panel-title');
    const panelStatus = document.getElementById('panel-status');
    const panelDesc = document.getElementById('panel-desc');
    const panelCode = document.querySelector('#panel-code code');
    const specList = document.getElementById('spec-list');
    const practicesText = document.getElementById('practices-text');
    const utilBar = document.getElementById('util-bar');
    const trafficVal = document.getElementById('traffic-val');

    // Tab Switching Function
    function switchTab(target) {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${target}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        const activeContent = document.getElementById(`tab-${target}`);
        if (activeContent) activeContent.classList.add('active');
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    // Node Interaction
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const id = node.getAttribute('data-id');
            const data = componentData[id];
            if (!data) return;

            // Visual feedback
            nodes.forEach(n => n.classList.remove('active-focus'));
            node.classList.add('active-focus');

            // Update DOM
            panelTitle.innerText = data.title;
            panelStatus.innerText = data.status;
            panelDesc.innerText = data.description;
            panelCode.innerText = data.code;
            practicesText.innerText = data.practices;

            specList.innerHTML = '';
            data.specs.forEach(s => {
                const li = document.createElement('li');
                li.innerText = s;
                specList.appendChild(li);
            });

            // Randomize telemetry
            utilBar.style.width = Math.floor(Math.random() * 60 + 20) + '%';
            trafficVal.innerText = (Math.random() * 5).toFixed(1) + 'k req/s';

            // Default back to Overview when a user clicks manually
            switchTab('overview');
        });
    });

    // Simulation Engine
    async function runSimulation() {
        startSimBtn.disabled = true;
        startSimBtn.classList.remove('primary-pulse');
        startSimBtn.innerText = "Deployment in Progress...";
        logContainer.innerHTML = '';

        const pipelineSteps = [
            { id: 'repo', path: 'path-repo-cicd', msg: 'Change detected: Commit #8f2a1z to main.' },
            { id: 'cicd', path: 'path-cicd-meta', msg: 'CI: Running build and model validation suite...' },
            { id: 'data', path: 'path-data-eng', msg: 'Data: Fetching raw segments for retraining...' },
            { id: 'engineering', path: 'path-eng-fs', msg: 'Eng: Transforming feature vectors for v2.0' },
            { id: 'feature-store', path: 'path-fs-train', msg: 'FS: Synchronizing online feature sets...' },
            { id: 'training', path: 'path-train-reg-low', msg: 'Train: Starting distributed A100 training job...' },
            { id: 'reg-low', path: 'path-reglow-meta', msg: 'Reg: Model weights registered. Accuracy: 0.942' },
            { id: 'reg-up', path: 'path-cicd-reg-up', msg: 'Reg: Champion vs Challenger verification passed.' },
            { id: 'serving', path: 'path-serve-mon', msg: 'Serve: Rolling update to v2.0 (Canary 10%)' },
            { id: 'monitoring', msg: 'Mon: Health checks passed. Full rollout complete.' }
        ];

        for (const step of pipelineSteps) {
            const node = document.querySelector(`[data-id="${step.id}"]`);
            const path = document.getElementById(step.path);

            if (node) {
                node.scrollIntoView({ behavior: 'smooth', block: 'center' });
                node.click(); // Update info panel (defaults to Overview)
                node.classList.add('processing');

                // Narrative Flow: Switch to Implementation tab during the step
                await new Promise(r => setTimeout(r, 600));
                switchTab('implementation');
            }
            if (path) path.classList.add('active');

            addLog(step.msg, 'info');
            await new Promise(r => setTimeout(r, 1600));

            if (node) node.classList.remove('processing');
            if (path) {
                path.classList.remove('active');
                path.style.stroke = 'var(--accent)';
            }
            addLog(`Step ${step.id.toUpperCase()} Success.`, 'success');
        }

        startSimBtn.disabled = false;
        startSimBtn.classList.add('primary-pulse');
        startSimBtn.innerText = "Simulate Deployment";
        addLog("MLOps Cycle Complete: Production environment updated.", "success");
    }

    startSimBtn.addEventListener('click', runSimulation);

    function addLog(msg, type) {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logContainer.prepend(div);
    }

    // Live Flowchart Dynamics
    const uptimeEl = document.getElementById('uptime');
    const signalCountEl = document.getElementById('signal-count');
    let uptimeSeconds = 0;
    let signalCount = 0;

    // Heartbeat Timer
    setInterval(() => {
        uptimeSeconds++;
        const h = Math.floor(uptimeSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((uptimeSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (uptimeSeconds % 60).toString().padStart(2, '0');
        uptimeEl.innerText = `${h}:${m}:${s}`;
    }, 1000);

    // Ambient Pulses
    async function sendAmbientPulse() {
        if (startSimBtn.disabled) return; // Don't interfere with main simulation

        const paths = [
            'path-data-eng', 'path-eng-fs', 'path-fs-train',
            'path-repo-cicd', 'path-cicd-reg-up'
        ];
        const randomPathId = paths[Math.floor(Math.random() * paths.length)];
        const path = document.getElementById(randomPathId);

        if (path) {
            signalCount++;
            signalCountEl.innerText = signalCount;

            // Visual trigger
            path.classList.add('active');
            path.style.strokeOpacity = "0.6";

            // Randomize telemetry jitter
            utilBar.style.width = (parseFloat(utilBar.style.width) + (Math.random() - 0.5) * 5) + '%';

            setTimeout(() => {
                path.classList.remove('active');
                path.style.strokeOpacity = "";
            }, 1000);
        }
    }

    // Run ambient pulses every few seconds
    setInterval(sendAmbientPulse, 3000);
});
