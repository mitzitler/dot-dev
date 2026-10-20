/*
    this handler enforces:
    'nickname' limit (8 chars)
    msg char limit
    gives easy access to the front end
*/

// temp, localhost url
const BASE_URL = "http://localhost:8080"

async function request(path, options={}) {
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.error || `Request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }

    return res.json();
}

// GET 1
export function getMessage({ id }) {
    return request(`./guestbook/${id}`);
}

// GET ALL
export function getMessages() {
    return request("./guestbook");
}

// POST
export function postMessage({ name, msg}) {
    return request("/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, msg }),
    });
}
