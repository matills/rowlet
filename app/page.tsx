export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 flex flex-col items-center gap-8 text-center">
        <h1 className="font-display text-7xl text-shadow-retro">Owlist</h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          Track your favorite movies, series, and anime with vintage style
        </p>
        <div className="flex gap-4">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border-4 border-foreground bg-primary px-8 py-3 font-display text-lg text-primary-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            Get Started
          </button>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border-4 border-foreground bg-secondary px-8 py-3 font-display text-lg text-secondary-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
