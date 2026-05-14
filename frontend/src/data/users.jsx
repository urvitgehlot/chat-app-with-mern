

const recentUserMessages = [
    {
        id: 1,
        userName: "Alice Freeman",
        userImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEPffqIe373EZmQmdi7198BjiGSZYlrHaiXuDMZZW9I69SjBaoYISH-QkYd4ditAOBKUiRS2-zX5z_QItyaS4mK_E2y9meSjVk2_FsVUxPaZiWO3vMnCsRtjOq_jo79W6Qgs5yf964dOZxjKG3MxyqnCTFUGfpSnXCFX8cKHpg2aXnOuf0ultGz3kbWvkkUwF7OOwZVNZbDyo0UnjVyPGYwHnLHT6WD_-xlGtUT6TiBBDS5NOvAEb5FhwLDe3ykR_cbjGhbSipBV4",
        recentMessage: "Can we review the designs?",
        sentByCurrentUser: false,
        unreadCount: 2,
        recentMessageDate: new Date(2026, 2, 23, 10, 42) // March 23, 2026 at 10:42 AM
    },
    {
        id: 2,
        userName: "Team Project",
        userImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1aFHbxXFKgFC3YrqIv837AlDlnXQWlviRZLPYi5FhUnGZh-L01VlbKcjXdJHKlM-Hp1gjsQBukhjr_3LEcaPfEQ9MDG91vHKEXIeZjRKnfDrcbwDsLZpD6L2rBH1JkeMI1jxXGCgNjLDmadIGl_N6nBWAAWTAqU0k6PXmgJgWGH19YePwdWW0KuxInL2_7gu5zsvylRphsQQpxcG_oqmsSEco9j_JK19cLwxQHgyaddgwqNEwigFaGPE6PuSjmydlo-tkdTFvPYo',
        recentMessage: "Max: I uploaded the new files.",
        unreadCount: 5,
        recentMessageDate: new Date(2026, 2, 22, 9, 15) // March 22, 2025 at 9:15 AM
    },
    {
        id: 3,
        userName: "John Smith",
        userImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvbxd6a-NdKQvi6ECR2OsVpAg91A-BqQLYBjQh7P1bmUOTztbbuT_66FXqBtle5AccuWINQpC9zbtyQNkPEQNFgjgMwIzdYrilU-PTtx_lLGvLq8FBqoVUVpU_Jtpic2hQQdSPhhdUs8YiNTl4DXzT72iyIDqi1NwUBbxOFJ8cBNhjMJM4qootGvbPfnREoUdvp-GeADejwJro-xCbGEBYdx0AvsX7E6Z3EhsBttU8So9XVfGEEPcOIo1fSXmqimCT1Fbo0DKShc0",
        recentMessage: "Sounds good, thanks!",
        unreadCount: 1,
        recentMessageDate: new Date(2025, 10, 2, 9, 15) // November 2, 2025 at 9:15 AM
    },
    {
        id: 4,
        userName: "Sarah Connor",
        userImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzaVVlt22Ik_OlvSeOusMmQuJmZKXnsJwHb751D7_jNUUoO97_2PjxxBN42Ix_-j8CfSHLQn2AGOvRHfMjc-TOlcHd6onvdEGOSlM8MxtnWLyLL9iOFSOKM5HAlyXpmXjOXSi0jYaWvQpiBvUVXw8-khtlkZDRO36MGXCMVZAcsV-XsrIs3NadhqchHPfji7LgW0SSBDSvoJtF9iCMIW9UMRdtK_OM9lakUSxYkDj6r0YOIpL2_28iBNxnkRbBdhKFOpr6PrKlU2Y",
        recentMessage: "Sending the invoice now.",
        unreadCount: 0,
        recentMessageDate: new Date(2025, 9, 10, 10, 0) // October 10, 2025 at 10:00 AM
    },
    {
        id: 5,
        userName: "David Miller",
        userImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXdEUQVIOPRNmKFmHExv57jg24XX184Ob_4MluEBWp_p6w8B3LsGZm1g6VCcZ43nCusg9duQgN9DQ-VQxP2IFFRi9FfD263UEQxw-9kevmedWKDrfGvt0n0EKGaCWRjleCdr-bYjnDKbo0nhNxZEru38Xzevum3DpaDFyE3Rie5-wTmfLiVPIonKXwnCDwQMDEjZI7vOWc3YrEDb06W3-qnyK8Hmw6haWiELGUhYxBPrgx3j3r7Dy20crQoZLCvsxAoXB4bQErM5c",
        recentMessage: "Let's reschedule.",
        unreadCount: 0,
        recentMessageDate: new Date(2025, 9, 10, 10, 0) // October 10, 2025 at 10:00 AM
    },
    {
        id: 6,
        userName: "Design Team",
        userImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzaVVlt22Ik_OlvSeOusMmQuJmZKXnsJwHb751D7_jNUUoO97_2PjxxBN42Ix_-j8CfSHLQn2AGOvRHfMjc-TOlcHd6onvdEGOSlM8MxtnWLyLL9iOFSOKM5HAlyXpmXjOXSi0jYaWvQpiBvUVXw8-khtlkZDRO36MGXCMVZAcsV-XsrIs3NadhqchHPfji7LgW0SSBDSvoJtF9iCMIW9UMRdtK_OM9lakUSxYkDj6r0YOIpL2_28iBNxnkRbBdhKFOpr6PrKlU2Y",
        recentMessage: "Please check the Figma link",
        unreadCount: 0,
        recentMessageDate: new Date(2025, 9, 10, 10, 0) // October 10, 2025 at 10:00 AM
    },
    {
        id: 7,
        userName: "Emily Blunt",
        userImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-4RpKTQN4wS0zVaafCawglH3cpZIqIzs5g2SRzYzeVIEUpK-rx-G7MsBiL5vHaQeedFX00qcslJA3O9Oo-bLzHwlss2nCvja8D2g0NFpSxLVpa1QPRaocproOMNiaY7OQaRWVmE-CITPOjwP16d_7gzxTMMAUkJxqzT9qEFlbgPl8dKWySbSwkZ-R3O8s2eSiznahl6ri12uJWSKE80XuwE_oNXtlkBddTbPtMgWQ4MQxL3RifguB31-zrLmo9rCIg6Jn28yLOvI",
        recentMessage: "See you there!",
        unreadCount: 0,
        recentMessageDate: new Date(2025, 9, 10, 10, 0) // October 10, 2025 at 10:00 AM
    },
    {
        id: 8,
        userName: "Michael Chen",
        userImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmawD0xEIvKURrFYISLrcgEU44o4RoHHEI8iayjt5RfPo6AcwMSx96R8jCIXVaMCiG1LEiT-yC40a4GMFpwVwA4AORaSvLPkIg87qUR-1f0J5_jGJpkhHrg_jwPM3NCbVzOoxHFg92D2lXzLZrQU8b92y8mChQaoAvp286oDTusq6vlnXgp8c6KlqoW8M5wAqtS5EnHUZPfSurth2-gOGCsxJdOpd4md1ud5GwLGOew8rMU_RQLDwyLr5gb_pq4goD3Alk_6159u8",
        recentMessage: "Sending the invoice now.",
        unreadCount: 0,
        recentMessageDate: new Date(2025, 9, 10, 10, 0) // October 10, 2025 at 10:00 AM
    },
];

export {
    recentUserMessages,
};