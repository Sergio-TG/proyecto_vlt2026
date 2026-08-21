"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { buildRetiroStaffImageUrl, STAFF_PHOTO_FILES } from "@/lib/retiro-detox-vida-abundante"

type TeamMember = {
  role: string
  name: string
}

function StaffPortrait({
  fileName,
  alt,
}: {
  fileName: string
  alt: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <Image
      src={buildRetiroStaffImageUrl(fileName)}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-115"
      onError={() => setFailed(true)}
    />
  )
}

function StaffMemberCard({
  member,
  fileName,
}: {
  member: TeamMember
  fileName: string | null
}) {
  const alt = member.name ? `${member.role}, ${member.name}` : member.role

  return (
    <article className="flex h-full w-full flex-col justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden rounded-2xl aspect-[4/5] w-full bg-slate-100 group cursor-pointer">
        {fileName ? <StaffPortrait fileName={fileName} alt={alt} /> : null}
      </div>

      <div className="mt-3 mb-1 flex flex-col items-center justify-start text-center">
        <h3 className="mb-1 text-sm sm:text-base font-semibold text-primary leading-tight">
          {member.role}
        </h3>
        <p className="text-xs sm:text-[13px] md:text-sm font-medium text-slate-600 whitespace-nowrap tracking-tight text-center">
          {member.name}
        </p>
      </div>
    </article>
  )
}

export function RetiroDetoxStaff({
  title,
  members,
}: {
  title: string
  members: TeamMember[]
}) {
  return (
    <motion.section
      aria-labelledby="retiro-detox-staff-title"
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="mt-8 md:mt-10 rounded-3xl border border-slate-100 bg-slate-50/60 p-6 md:p-8"
    >
      <h3
        id="retiro-detox-staff-title"
        className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8"
      >
        {title}
      </h3>
      <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 lg:grid-cols-4 gap-5">
        {(members ?? []).map((member, index) => (
          <li key={`${member.role}-${member.name || index}`} className="h-full">
            <StaffMemberCard
              member={member}
              fileName={STAFF_PHOTO_FILES[index] ?? null}
            />
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
