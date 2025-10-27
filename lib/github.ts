export async function getGitHubRepos() {
  const response = await fetch("/api/github/repos")
  if (!response.ok) throw new Error("Failed to fetch repos")
  return response.json()
}

export async function createGitHubRepo(name: string, description: string) {
  const response = await fetch("/api/github/repos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  })
  if (!response.ok) throw new Error("Failed to create repo")
  return response.json()
}

export async function getGitHubFiles(owner: string, repo: string, path = "") {
  const params = new URLSearchParams({ owner, repo, path })
  const response = await fetch(`/api/github/files?${params}`)
  if (!response.ok) throw new Error("Failed to fetch files")
  return response.json()
}

export async function uploadToGitHub(owner: string, repo: string, path: string, content: string, message: string) {
  const response = await fetch("/api/github/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner, repo, path, content, message }),
  })
  if (!response.ok) throw new Error("Failed to upload file")
  return response.json()
}

export async function deleteFromGitHub(owner: string, repo: string, path: string, sha: string) {
  const response = await fetch("/api/github/files", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner, repo, path, sha }),
  })
  if (!response.ok) throw new Error("Failed to delete file")
  return response.json()
}
