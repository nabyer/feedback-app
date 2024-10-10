import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export let options = {
    thresholds: {
        "errors": ["rate==0"]
    }
};

const addCheck = (response, checks) => {
    let passed = check(response, checks);
    if (!passed) {
        errorRate.add(1);
    }
}

// POST /feedback 
const createFeedback = () => {
    const payload = {
        title: 'Test Feedback',
        text: 'This is a test feedback created by integration tests.'
    };

    const headers = { 'Content-Type': 'application/json' };

    const response = http.post(`${BASE_URL}/feedback`, JSON.stringify(payload), { headers });

    addCheck(response, {
        'POST /feedback valid data: status code 201 (Created)': 
            (res) => res.status === 201,
        'POST /feedback response has message': 
            (res) => res.json('message') === 'Feedback erfolgreich gespeichert.',
        'POST /feedback created matched sent data':
            (res) => res.json().data.title === payload.title &&
                    res.json().data.text === payload.text    
    });
};

// POST /feedback empty body
const createFeedbackNoData = () => {
    const payload = JSON.stringify({});
    
    const headers = { 'Content-Type': 'application/json' };

    const response = http.post(`${BASE_URL}/feedback`, payload, { headers });

    addCheck(response, {
        'POST /feedback missing data: status code 400 (Bad Request)': 
            (res) => res.status === 400,
        'POST /feedback error message for missing data': 
            (res) => res.json().errors.length === 2,
        'POST /feedback error message 1 for missing data (title)': 
            (res) => res.json().errors[0].msg === 'Titel ist erforderlich.',
        'POST /feedback error message 2 for missing data (text)': 
            (res) => res.json().errors[1].msg === 'Text ist erforderlich.'
            
    });
};

// POST /feedback no title
const createFeedbackNoTitle = () => {
    const payload = JSON.stringify({
        text: 'This is feedback with no title.'
    });
    
    const headers = { 'Content-Type': 'application/json' };

    const response = http.post(`${BASE_URL}/feedback`, payload, { headers });

    addCheck(response, {
        'POST /feedback missing title: status code 400 (Bad Request)': 
            (res) => res.status === 400,
        'POST /feedback error message for missing title': 
            (res) => res.json().errors[0].msg === 'Titel ist erforderlich.'
    });
};

// POST /feedback no text
const createFeedbackNoText = () => {
    const payload = JSON.stringify({
        title: 'Feedback without text.'
    });
    
    const headers = { 'Content-Type': 'application/json' };

    const response = http.post(`${BASE_URL}/feedback`, payload, { headers });

    addCheck(response, {
        'POST /feedback missing text: status code 400 (Bad Request)': 
            (res) => res.status === 400,
        'POST /feedback error message for missing text': 
            (res) => res.json().errors[0].msg === 'Text ist erforderlich.'
    });
};

// POST /feedback invalid data
const createFeedbackInvalidData = () => {
    const payload = JSON.stringify({
        invalidtitle: 'Invalid title.',
        invalidtext: 'Invalid text'
    });
    
    const headers = { 'Content-Type': 'application/json' };

    const response = http.post(`${BASE_URL}/feedback`, payload, { headers });

    addCheck(response, {
        'POST /feedback invalid data: status code 400 (Bad Request)': 
            (res) => res.status === 400,
        'POST /feedback error message for invalid data': 
            (res) => res.json().errors.length === 2,
        'POST /feedback error message 1 for invalid data (title)': 
            (res) => res.json().errors[0].msg === 'Titel ist erforderlich.',
        'POST /feedback error message 2 for invalid data (text)': 
            (res) => res.json().errors[1].msg === 'Text ist erforderlich.'
    });
};

// GET /feedback
const getAllFeedback = () => {
    const response = http.get(`${BASE_URL}/feedback`);

    addCheck(response, {
        'GET /feedback status code 200 (OK)': 
            (res) => res.status === 200,
        'GET /feedback response contains an array': 
            (res) => Array.isArray(res.json().data)
    });
};

// DELETE /feedback/:title
const deleteFeedback = () => {
    const response = http.del(`${BASE_URL}/feedback/Test Feedback`);

    addCheck(response, {
        'DELETE /feedback/:title status code 200 (OK)': 
            (res) => res.status === 200,
        'DELETE /feedback/:title response has message': 
            (res) => res.json('message') === 'Feedback erfolgreich geloescht.'
    });
};

// DELETE /feedback/:title not found
const deleteNonExistentFeedback = () => {
    const response = http.del(`${BASE_URL}/feedback/NonExistentFeedback`);

    addCheck(response, {
        'DELETE /feedback/:title status code 404 (Not Found)': 
            (res) => res.status === 404,
        'DELETE /feedback/:title response has error message': 
            (res) => res.json('error') === 'Feedback nicht gefunden.'
    });
};


export default function () {
    createFeedback();
    createFeedbackNoData();
    createFeedbackNoTitle();
    createFeedbackNoText();
    createFeedbackInvalidData();
    getAllFeedback();
    deleteFeedback();
    deleteNonExistentFeedback();
}