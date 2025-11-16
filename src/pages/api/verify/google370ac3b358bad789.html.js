export async function GET() {
  const content = "google-site-verification: google370ac3b358bad789.html";

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/html'
    }
  });
}
