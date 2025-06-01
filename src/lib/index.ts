// place files you want to import through the `$lib` alias in this folder.

type SSEClient = {
	write: (msg: string) => void;
};

const clients: SSEClient[] = [];

// Exported methods for managing clients
export function addClient(client: SSEClient) {
	clients.push(client);
}

export function removeClient(client: SSEClient) {
	const index = clients.indexOf(client);
	if (index !== -1) {
		clients.splice(index, 1);
	}
}

export function broadcast(message: string) {
	for (const client of clients) {
		client.write(`data: ${message}\n\n`);
	}
}
