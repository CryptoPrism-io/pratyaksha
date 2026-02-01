import { Link } from 'react-router-dom'
import { MothLogo } from '../brand/MothLogo'
import { BrandWordmark } from '../brand/BrandWordmark'

export function BlogFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <MothLogo size="md" />
              <BrandWordmark size="lg" variant="default" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              See Your Mind. Clearly.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/logs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AI Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Research
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Becoming. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
