import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  return handleExport(req);
}

export async function POST(req: NextRequest) {
  return handleExport(req);
}

async function handleExport(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || 'a0000000-0000-0000-0000-000000000001';

  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';

  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }

  const targetUrl = `${baseUrl}/report/print/${id}`;
  let browser: any = null;

  try {
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

    let executablePath: string;

    if (isLocal) {
      // Local Chrome/Edge detection for local dev
      executablePath =
        process.env.CHROME_PATH ||
        (process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome');
    } else {
      // Vercel serverless chromium-min configuration
      chromium.setGraphicsMode = false;
      executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      );
    }

    browser = await puppeteer.launch({
      args: isLocal ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args,
      defaultViewport: { width: 816, height: 1056 }, // 8.5in x 11in at 96 DPI
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Navigate to the hidden print UI route
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Generate US Letter PDF Buffer with zero margins and background graphics enabled
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0in',
        right: '0in',
        bottom: '0in',
        left: '0in',
      },
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    // Return binary PDF stream
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Beacon-Audit-Report-${id}.pdf"`,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error('Error closing browser:', closeErr);
      }
    }

    console.error('PDF Export Error:', err);

    // Fallback: If chromium executable cannot be spawned in local environment without Chrome,
    // redirect gracefully to the print page directly
    if (req.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(targetUrl);
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to generate PDF audit report',
        printUrl: targetUrl,
      },
      { status: 500 }
    );
  }
}
