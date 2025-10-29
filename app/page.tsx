"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github, MessageCircle, X, Send } from "lucide-react"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ownerData, setOwnerData] = useState<any>(null)

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    window.location.href = "/api/auth/discord"
  }

  // Fetch owner data from Lanyard API
  const fetchOwnerData = async () => {
    try {
      const response = await fetch('https://api.lanyard.rest/v1/users/587709425708695552')
      const data = await response.json()
      if (data.success) {
        setOwnerData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch owner data:', error)
    }
  }

  // Fetch owner data on component mount
  useEffect(() => {
    fetchOwnerData()
  }, [])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name.trim() || !contactForm.message.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      })
      
      if (response.ok) {
        setContactForm({ name: "", message: "" })
        setShowContactForm(false)
        alert("Message sent successfully!")
      } else {
        alert("Failed to send message")
      }
    } catch (error) {
      alert("Failed to send message")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col relative">
      {/* Background Image - Full Coverage */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: "url('https://cdn.magicdecor.in/com/2023/11/06170330/Amazing-Graffiti-Wallpaper-With-Cool-Texts-for-Walls-710x488.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Fog overlay for blending - Full Coverage */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 z-10"></div>
      <div className="absolute inset-0 backdrop-blur-sm z-10"></div>
      
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Github className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">
              <span className="text-primary">K</span>
              <span className="text-white">oderstore</span>
            </span>
          </div>
          <Button onClick={handleDiscordLogin} disabled={isLoading} className="gap-2">
            <DiscordIcon className="w-4 h-4" />
            {isLoading ? "Connecting..." : "Login with Discord"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative z-20">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-balance">
              Cloud Storage <span className="text-primary">K</span>
              <span className="text-white">oderstore</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance">
              Store, manage, and share your files seamlessly. Authenticate with Discord, store everything securely.
              Simple, secure, and always yours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={handleDiscordLogin} disabled={isLoading} size="lg" className="gap-2">
              <DiscordIcon className="w-5 h-5" />
              Get Started with Discord
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section 
        className="border-t border-border/40 py-20 px-4 relative z-20"
        style={{ 
          backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3Aj3d_zPlNLecVaxPuqGgxbL7xLjfOZx_YA&s')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'crisp-edges'
        }}
      >
        {/* Fog overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="bg-card/80 border border-border/40 rounded-xl p-8 backdrop-blur-md">
            <div className="flex flex-col items-center space-y-4">
              <img 
                src={ownerData?.discord_user?.avatar 
                  ? `https://cdn.discordapp.com/avatars/${ownerData.discord_user.id}/${ownerData.discord_user.avatar}.png` 
                  : '/placeholder-user.jpg'
                } 
                alt={ownerData?.discord_user?.display_name || 'Owner'} 
                className="w-20 h-20 rounded-full border-4 border-primary/20"
              />
              <div>
                <h3 className="text-2xl font-bold">{ownerData?.discord_user?.display_name || ownerData?.discord_user?.username || 'Developer'}</h3>
                <p className="text-muted-foreground">Creator of Koderstore</p>
              </div>
              <Button 
                onClick={() => setShowContactForm(true)}
                size="lg" 
                className="gap-2 mt-4"
              >
                <MessageCircle className="w-5 h-5" />
                Message Me
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        className="border-t border-border/40 py-20 px-4 relative z-20"
        style={{ 
          backgroundImage: "url('https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ78NX6RmKm4nxJzQsL3QQcl1GZxZ1Tw1bJ2lUgm5kaaee80gev')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Fog overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">Why Koderstore?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Discord Authentication",
                description: "Sign in securely with your Discord account. No passwords to remember.",
                icon: "🔐",
              },
              {
                title: "Secure Storage",
                description: "Your files are stored securely with full version control included.",
                icon: "📦",
              },
              {
                title: "Easy File Management",
                description: "Upload, organize, preview, and share files with an intuitive interface.",
                icon: "📁",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-4 mt-auto relative z-20 bg-background">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>Koderstore - Secure cloud storage for developers</p>
        </div>
      </footer>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img 
                  src={ownerData?.discord_user?.avatar 
                    ? `https://cdn.discordapp.com/avatars/${ownerData.discord_user.id}/${ownerData.discord_user.avatar}.png` 
                    : '/placeholder-user.jpg'
                  } 
                  alt={ownerData?.discord_user?.display_name || 'Owner'} 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{ownerData?.discord_user?.display_name || ownerData?.discord_user?.username || 'Developer'}</p>
                  <p className="text-sm text-muted-foreground">Send me a message</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Your message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 border border-border/40 rounded-md bg-input resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !contactForm.name.trim() || !contactForm.message.trim()}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
